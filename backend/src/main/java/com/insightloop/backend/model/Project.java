package com.insightloop.backend.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Project {
    private UUID id;
    private String name;
    private String description;
    private OffsetDateTime createdAt;

    public Project() {}

    public Project(UUID id, String name, String description, OffsetDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}