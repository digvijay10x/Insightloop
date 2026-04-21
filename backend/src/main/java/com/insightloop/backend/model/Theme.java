package com.insightloop.backend.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Theme {
    private UUID id;
    private UUID analysisId;
    private String title;
    private String priority;
    private int mentionCount;
    private String sentiment;
    private double priorityScore;
    private String aiReasoning;
    private String source;
    private OffsetDateTime createdAt;

    public Theme() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getAnalysisId() { return analysisId; }
    public void setAnalysisId(UUID analysisId) { this.analysisId = analysisId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public int getMentionCount() { return mentionCount; }
    public void setMentionCount(int mentionCount) { this.mentionCount = mentionCount; }
    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }
    public double getPriorityScore() { return priorityScore; }
    public void setPriorityScore(double priorityScore) { this.priorityScore = priorityScore; }
    public String getAiReasoning() { return aiReasoning; }
    public void setAiReasoning(String aiReasoning) { this.aiReasoning = aiReasoning; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}