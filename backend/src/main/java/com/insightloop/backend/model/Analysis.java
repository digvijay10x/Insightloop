package com.insightloop.backend.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Analysis {
    private UUID id;
    private UUID projectId;
    private String type;
    private String sourceType;
    private String rawInput;
    private int reviewCount;
    private int themeCount;
    private OffsetDateTime createdAt;

    public Analysis() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public String getRawInput() { return rawInput; }
    public void setRawInput(String rawInput) { this.rawInput = rawInput; }
    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
    public int getThemeCount() { return themeCount; }
    public void setThemeCount(int themeCount) { this.themeCount = themeCount; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}