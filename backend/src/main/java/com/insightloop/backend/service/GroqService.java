package com.insightloop.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String analyzeReviews(String reviews, String sourceType) throws Exception {
        String systemPrompt = """
            You are a product feedback analyst. Analyze the following user reviews and extract key themes.
            For each theme provide:
            - title: short descriptive title
            - mention_count: how many reviews mention this theme
            - sentiment: one of "positive", "negative", "mixed"
            - priority_score: float between 0 and 1 (1 = most critical)
            - ai_reasoning: exactly 2 sentences explaining why this theme matters
            - quotes: array of 3-5 exact quotes from the reviews that support this theme

            Return ONLY a pure JSON array, no markdown, no explanation. Example format:
            [{"title":"...","mention_count":3,"sentiment":"negative","priority_score":0.85,"ai_reasoning":"...","quotes":["...","..."]}]
            """;

        String userPrompt = "Source: " + sourceType + "\n\nReviews:\n" + reviews;

        return callGroq(systemPrompt, userPrompt);
    }

    public String analyzeCompetitor(String ownReviews, String competitorReviews) throws Exception {
        String systemPrompt = """
            You are a competitive product analyst. Compare two sets of user reviews: one for "our product" and one for a "competitor product".
            Extract and return a JSON object with:
            - own_strengths: array of themes where our product excels (each with title, mention_count, sentiment, priority_score, ai_reasoning, quotes)
            - competitor_strengths: array of themes where the competitor excels (same fields)
            - shared_pain_points: array of themes both products struggle with (same fields)
            - summary: one sentence summarizing the competitive landscape

            Return ONLY pure JSON, no markdown, no explanation.
            """;

        String userPrompt = "OUR PRODUCT REVIEWS:\n" + ownReviews + "\n\nCOMPETITOR REVIEWS:\n" + competitorReviews;

        return callGroq(systemPrompt, userPrompt);
    }

    private String callGroq(String systemPrompt, String userPrompt) throws Exception {
        String requestBody = objectMapper.writeValueAsString(new java.util.LinkedHashMap<>() {{
            put("model", model);
            put("messages", new java.util.ArrayList<>() {{
                add(new java.util.LinkedHashMap<>() {{
                    put("role", "system");
                    put("content", systemPrompt);
                }});
                add(new java.util.LinkedHashMap<>() {{
                    put("role", "user");
                    put("content", userPrompt);
                }});
            }});
            put("temperature", 0.3);
            put("max_tokens", 4096);
        }});

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").get(0).path("message").path("content").asText();

        // Strip markdown fences if present
        content = content.trim();
        if (content.startsWith("```json")) {
            content = content.substring(7);
        } else if (content.startsWith("```")) {
            content = content.substring(3);
        }
        if (content.endsWith("```")) {
            content = content.substring(0, content.length() - 3);
        }

        return content.trim();
    }
}