package com.insightloop.backend.controller;

import com.insightloop.backend.model.Analysis;
import com.insightloop.backend.model.Theme;
import com.insightloop.backend.model.ReviewQuote;
import com.insightloop.backend.repository.AnalysisRepository;
import com.insightloop.backend.repository.ThemeRepository;
import com.insightloop.backend.repository.ReviewQuoteRepository;
import com.insightloop.backend.service.AnalysisService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/analyses")
public class AnalysisController {

    private final AnalysisService analysisService;
    private final AnalysisRepository analysisRepository;
    private final ThemeRepository themeRepository;
    private final ReviewQuoteRepository reviewQuoteRepository;

    public AnalysisController(AnalysisService analysisService, AnalysisRepository analysisRepository,
                              ThemeRepository themeRepository, ReviewQuoteRepository reviewQuoteRepository) {
        this.analysisService = analysisService;
        this.analysisRepository = analysisRepository;
        this.themeRepository = themeRepository;
        this.reviewQuoteRepository = reviewQuoteRepository;
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter analyze(@PathVariable UUID projectId, @RequestBody Map<String, String> body) {
        SseEmitter emitter = new SseEmitter(300000L);

        String rawInput = body.get("rawInput");
        String sourceType = body.getOrDefault("sourceType", "manual");

        new Thread(() -> analysisService.runAnalysis(projectId, rawInput, sourceType, emitter)).start();

        return emitter;
    }

    @PostMapping(value = "/competitor/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter competitorAnalysis(@PathVariable UUID projectId, @RequestBody Map<String, String> body) {
        SseEmitter emitter = new SseEmitter(300000L);

        String ownReviews = body.get("ownReviews");
        String competitorReviews = body.get("competitorReviews");

        new Thread(() -> analysisService.runCompetitorAnalysis(projectId, ownReviews, competitorReviews, emitter)).start();

        return emitter;
    }

    @GetMapping
    public List<Analysis> getAll(@PathVariable UUID projectId) {
        return analysisRepository.findByProjectId(projectId);
    }

    @GetMapping("/{analysisId}/themes")
    public List<Map<String, Object>> getThemes(@PathVariable UUID projectId, @PathVariable UUID analysisId) {
        List<Theme> themes = themeRepository.findByAnalysisId(analysisId);
        return themes.stream().map(t -> {
            List<ReviewQuote> quotes = reviewQuoteRepository.findByThemeId(t.getId());
            return Map.<String, Object>of(
                "id", t.getId().toString(),
                "title", t.getTitle(),
                "priority", t.getPriority(),
                "mentionCount", t.getMentionCount(),
                "sentiment", t.getSentiment(),
                "priorityScore", t.getPriorityScore(),
                "aiReasoning", t.getAiReasoning(),
                "source", t.getSource() != null ? t.getSource() : "own",
                "quotes", quotes.stream().map(ReviewQuote::getQuote).collect(Collectors.toList())
            );
        }).collect(Collectors.toList());
    }
}