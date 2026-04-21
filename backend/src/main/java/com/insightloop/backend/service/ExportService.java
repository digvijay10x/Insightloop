package com.insightloop.backend.service;

import com.insightloop.backend.model.Theme;
import com.insightloop.backend.model.ReviewQuote;
import com.insightloop.backend.repository.ThemeRepository;
import com.insightloop.backend.repository.ReviewQuoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ExportService {

    private final ThemeRepository themeRepository;
    private final ReviewQuoteRepository reviewQuoteRepository;

    public ExportService(ThemeRepository themeRepository, ReviewQuoteRepository reviewQuoteRepository) {
        this.themeRepository = themeRepository;
        this.reviewQuoteRepository = reviewQuoteRepository;
    }

    public String exportCsv(UUID analysisId) {
        List<Theme> themes = themeRepository.findByAnalysisId(analysisId);
        StringBuilder sb = new StringBuilder();
        sb.append("Title,Priority,Mentions,Sentiment,Priority Score,AI Reasoning,Quotes\n");

        for (Theme t : themes) {
            List<ReviewQuote> quotes = reviewQuoteRepository.findByThemeId(t.getId());
            String quotesStr = quotes.stream()
                    .map(q -> q.getQuote().replace("\"", "\"\""))
                    .reduce((a, b) -> a + " | " + b)
                    .orElse("");

            sb.append(String.format("\"%s\",\"%s\",%d,\"%s\",%.2f,\"%s\",\"%s\"\n",
                    t.getTitle().replace("\"", "\"\""),
                    t.getPriority(),
                    t.getMentionCount(),
                    t.getSentiment(),
                    t.getPriorityScore(),
                    t.getAiReasoning().replace("\"", "\"\""),
                    quotesStr
            ));
        }
        return sb.toString();
    }

    public String exportMarkdown(UUID analysisId) {
        List<Theme> themes = themeRepository.findByAnalysisId(analysisId);
        StringBuilder sb = new StringBuilder();
        sb.append("# Feedback Analysis Report\n\n");

        for (Theme t : themes) {
            List<ReviewQuote> quotes = reviewQuoteRepository.findByThemeId(t.getId());

            sb.append("## ").append(t.getTitle()).append(" [").append(t.getPriority()).append("]\n\n");
            sb.append("- **Mentions:** ").append(t.getMentionCount()).append("\n");
            sb.append("- **Sentiment:** ").append(t.getSentiment()).append("\n");
            sb.append("- **Priority Score:** ").append(String.format("%.2f", t.getPriorityScore())).append("\n");
            sb.append("- **AI Reasoning:** ").append(t.getAiReasoning()).append("\n\n");

            if (!quotes.isEmpty()) {
                sb.append("**Quotes:**\n\n");
                for (ReviewQuote q : quotes) {
                    sb.append("> ").append(q.getQuote()).append("\n\n");
                }
            }
            sb.append("---\n\n");
        }
        return sb.toString();
    }
}