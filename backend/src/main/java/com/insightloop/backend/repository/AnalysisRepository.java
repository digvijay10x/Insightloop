package com.insightloop.backend.repository;

import com.insightloop.backend.model.Analysis;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class AnalysisRepository {

    private final JdbcTemplate jdbcTemplate;

    public AnalysisRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Analysis> rowMapper = (ResultSet rs, int rowNum) -> {
        Analysis a = new Analysis();
        a.setId(UUID.fromString(rs.getString("id")));
        a.setProjectId(UUID.fromString(rs.getString("project_id")));
        a.setType(rs.getString("type"));
        a.setSourceType(rs.getString("source_type"));
        a.setRawInput(rs.getString("raw_input"));
        a.setReviewCount(rs.getInt("review_count"));
        a.setThemeCount(rs.getInt("theme_count"));
        a.setCreatedAt(rs.getObject("created_at", java.time.OffsetDateTime.class));
        return a;
    };

    public List<Analysis> findByProjectId(UUID projectId) {
        return jdbcTemplate.query("SELECT * FROM analyses WHERE project_id = ? ORDER BY created_at DESC", rowMapper, projectId);
    }

    public Optional<Analysis> findById(UUID id) {
        List<Analysis> results = jdbcTemplate.query("SELECT * FROM analyses WHERE id = ?", rowMapper, id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Analysis save(UUID projectId, String type, String sourceType, String rawInput, int reviewCount) {
        UUID id = UUID.randomUUID();
        jdbcTemplate.update(
            "INSERT INTO analyses (id, project_id, type, source_type, raw_input, review_count) VALUES (?, ?, ?, ?, ?, ?)",
            id, projectId, type, sourceType, rawInput, reviewCount
        );
        return findById(id).orElseThrow();
    }

    public void updateThemeCount(UUID id, int themeCount) {
        jdbcTemplate.update("UPDATE analyses SET theme_count = ? WHERE id = ?", themeCount, id);
    }

    public int countAll() {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM analyses", Integer.class);
    }
}