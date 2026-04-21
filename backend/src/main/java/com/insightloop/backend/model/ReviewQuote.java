package com.insightloop.backend.model;

import java.util.UUID;

public class ReviewQuote {
    private UUID id;
    private UUID themeId;
    private String quote;
    private int originalIndex;

    public ReviewQuote() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getThemeId() { return themeId; }
    public void setThemeId(UUID themeId) { this.themeId = themeId; }
    public String getQuote() { return quote; }
    public void setQuote(String quote) { this.quote = quote; }
    public int getOriginalIndex() { return originalIndex; }
    public void setOriginalIndex(int originalIndex) { this.originalIndex = originalIndex; }
}