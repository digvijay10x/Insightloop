package com.insightloop.backend.repository;

import com.insightloop.backend.model.Theme;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.util.List;
import java.util.UUID;

@Repository
public class ThemeRepository {

    private final JdbcTemplate jdbcTemplate;

    public ThemeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Theme> rowMapper = (ResultSet rs, int rowNum) -> {
        Theme t = new Theme();
        t.setId(UUID.fromString(rs.getString("id")));
        t.setAnalysisId(UUID.fromString(rs.getString("analysis_id")));
        t.setTitle(rs.getString("title"));
        t.setPriority(rs.getString("priority"));
        t.setMentionCount(rs.getInt("mention_count"));
        t.setSentiment(rs.getString("sentiment"));
        t.setPriorityScore(rs.getDouble("priority_score"));
        t.setAiReasoning(rs.getString("ai_reasoning"));
        t.setSource(rs.getString("source"));
        t.setCreatedAt(rs.getObject("created_at", java.time.OffsetDateTime.class));
        return t;
    };

    public List<Theme> findByAnalysisId(UUID analysisId) {
        return jdbcTemplate.query("SELECT * FROM themes WHERE analysis_id = ? ORDER BY priority_score DESC", rowMapper, analysisId);
    }

    public Theme save(UUID analysisId, String title, String priority, int mentionCount, String sentiment, double priorityScore, String aiReasoning, String source) {
        UUID id = UUID.randomUUID();
        jdbcTemplate.update(
            "INSERT INTO themes (id, analysis_id, title, priority, mention_count, sentiment, priority_score, ai_reasoning, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            id, analysisId, title, priority, mentionCount, sentiment, priorityScore, aiReasoning, source
        );
        Theme t = new Theme();
        t.setId(id);
        t.setAnalysisId(analysisId);
        t.setTitle(title);
        t.setPriority(priority);
        t.setMentionCount(mentionCount);
        t.setSentiment(sentiment);
        t.setPriorityScore(priorityScore);
        t.setAiReasoning(aiReasoning);
        t.setSource(source);
        return t;
    }

    public int countAll() {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM themes", Integer.class);
    }
}