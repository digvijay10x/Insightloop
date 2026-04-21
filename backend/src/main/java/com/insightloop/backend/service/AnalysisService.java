package com.insightloop.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insightloop.backend.model.Analysis;
import com.insightloop.backend.model.Theme;
import com.insightloop.backend.repository.AnalysisRepository;
import com.insightloop.backend.repository.ReviewQuoteRepository;
import com.insightloop.backend.repository.ThemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AnalysisService {

    private final GroqService groqService;
    private final AnalysisRepository analysisRepository;
    private final ThemeRepository themeRepository;
    private final ReviewQuoteRepository reviewQuoteRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnalysisService(GroqService groqService, AnalysisRepository analysisRepository,
                           ThemeRepository themeRepository, ReviewQuoteRepository reviewQuoteRepository) {
        this.groqService = groqService;
        this.analysisRepository = analysisRepository;
        this.themeRepository = themeRepository;
        this.reviewQuoteRepository = reviewQuoteRepository;
    }

    public void runAnalysis(UUID projectId, String rawInput, String sourceType, SseEmitter emitter) {
        try {
            // Step 1: Send status
            sendEvent(emitter, "status", Map.of("step", "saving", "message", "Saving analysis..."));

            String[] reviews = rawInput.split("\\n+");
            int reviewCount = reviews.length;

            Analysis analysis = analysisRepository.save(projectId, "own", sourceType, rawInput, reviewCount);

            // Step 2: Call Groq
            sendEvent(emitter, "status", Map.of("step", "analyzing", "message", "AI is analyzing " + reviewCount + " reviews..."));

            String groqResponse = groqService.analyzeReviews(rawInput, sourceType);
            List<Map<String, Object>> themesData = objectMapper.readValue(groqResponse, new TypeReference<>() {});

            // Step 3: Save themes and stream each one
            sendEvent(emitter, "status", Map.of("step", "extracting", "message", "Extracting " + themesData.size() + " themes..."));

            int themeCount = 0;
            for (Map<String, Object> td : themesData) {
                double priorityScore = toDouble(td.get("priority_score"));
                String priority = priorityScore >= 0.7 ? "P1" : priorityScore >= 0.4 ? "P2" : "P3";

                Theme theme = themeRepository.save(
                    analysis.getId(),
                    (String) td.get("title"),
                    priority,
                    toInt(td.get("mention_count")),
                    (String) td.get("sentiment"),
                    priorityScore,
                    (String) td.get("ai_reasoning"),
                    "own"
                );

                // Save quotes
                List<String> quotes = (List<String>) td.get("quotes");
                if (quotes != null) {
                    for (int i = 0; i < quotes.size(); i++) {
                        reviewQuoteRepository.save(theme.getId(), quotes.get(i), i);
                    }
                }

                // Stream theme to frontend
                Map<String, Object> themeEvent = Map.of(
                    "id", theme.getId().toString(),
                    "title", theme.getTitle(),
                    "priority", priority,
                    "mentionCount", theme.getMentionCount(),
                    "sentiment", theme.getSentiment(),
                    "priorityScore", priorityScore,
                    "aiReasoning", theme.getAiReasoning(),
                    "quotes", quotes != null ? quotes : List.of()
                );
                sendEvent(emitter, "theme", themeEvent);
                themeCount++;
            }

            analysisRepository.updateThemeCount(analysis.getId(), themeCount);

            sendEvent(emitter, "complete", Map.of("analysisId", analysis.getId().toString(), "themeCount", themeCount));
            emitter.complete();

        } catch (Exception e) {
            try {
                sendEvent(emitter, "error", Map.of("message", e.getMessage()));
                emitter.completeWithError(e);
            } catch (Exception ignored) {}
        }
    }

    public void runCompetitorAnalysis(UUID projectId, String ownReviews, String competitorReviews, SseEmitter emitter) {
        try {
            sendEvent(emitter, "status", Map.of("step", "saving", "message", "Saving competitor analysis..."));

            String combined = ownReviews + "\n---COMPETITOR---\n" + competitorReviews;
            int reviewCount = ownReviews.split("\\n+").length + competitorReviews.split("\\n+").length;

            Analysis analysis = analysisRepository.save(projectId, "competitor", "competitor", combined, reviewCount);

            sendEvent(emitter, "status", Map.of("step", "analyzing", "message", "AI is comparing products..."));

            String groqResponse = groqService.analyzeCompetitor(ownReviews, competitorReviews);
            JsonNode root = objectMapper.readTree(groqResponse);

            int themeCount = 0;

            themeCount += processCompetitorThemes(root.path("own_strengths"), analysis.getId(), "own", emitter);
            themeCount += processCompetitorThemes(root.path("competitor_strengths"), analysis.getId(), "competitor", emitter);
            themeCount += processCompetitorThemes(root.path("shared_pain_points"), analysis.getId(), "shared", emitter);

            analysisRepository.updateThemeCount(analysis.getId(), themeCount);

            String summary = root.has("summary") ? root.get("summary").asText() : "";
            sendEvent(emitter, "complete", Map.of("analysisId", analysis.getId().toString(), "themeCount", themeCount, "summary", summary));
            emitter.complete();

        } catch (Exception e) {
            try {
                sendEvent(emitter, "error", Map.of("message", e.getMessage()));
                emitter.completeWithError(e);
            } catch (Exception ignored) {}
        }
    }

    private int processCompetitorThemes(JsonNode themesNode, UUID analysisId, String source, SseEmitter emitter) throws Exception {
        int count = 0;
        if (themesNode.isArray()) {
            for (JsonNode td : themesNode) {
                double priorityScore = td.path("priority_score").asDouble(0);
                String priority = priorityScore >= 0.7 ? "P1" : priorityScore >= 0.4 ? "P2" : "P3";

                Theme theme = themeRepository.save(
                    analysisId,
                    td.path("title").asText(),
                    priority,
                    td.path("mention_count").asInt(0),
                    td.path("sentiment").asText("mixed"),
                    priorityScore,
                    td.path("ai_reasoning").asText(""),
                    source
                );

                List<String> quotes = objectMapper.convertValue(td.path("quotes"), new TypeReference<>() {});
                if (quotes != null) {
                    for (int i = 0; i < quotes.size(); i++) {
                        reviewQuoteRepository.save(theme.getId(), quotes.get(i), i);
                    }
                }

                Map<String, Object> themeEvent = Map.of(
                    "id", theme.getId().toString(),
                    "title", theme.getTitle(),
                    "priority", priority,
                    "mentionCount", theme.getMentionCount(),
                    "sentiment", theme.getSentiment(),
                    "priorityScore", priorityScore,
                    "aiReasoning", theme.getAiReasoning(),
                    "source", source,
                    "quotes", quotes != null ? quotes : List.of()
                );
                sendEvent(emitter, "theme", themeEvent);
                count++;
            }
        }
        return count;
    }

    private void sendEvent(SseEmitter emitter, String eventName, Object data) throws Exception {
        emitter.send(SseEmitter.event().name(eventName).data(objectMapper.writeValueAsString(data)));
    }

    private double toDouble(Object obj) {
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        try { return Double.parseDouble(obj.toString()); } catch (Exception e) { return 0; }
    }

    private int toInt(Object obj) {
        if (obj instanceof Number) return ((Number) obj).intValue();
        try { return Integer.parseInt(obj.toString()); } catch (Exception e) { return 0; }
    }
}