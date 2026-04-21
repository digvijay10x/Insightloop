package com.insightloop.backend.repository;

import com.insightloop.backend.model.ReviewQuote;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.util.List;
import java.util.UUID;

@Repository
public class ReviewQuoteRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReviewQuoteRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<ReviewQuote> rowMapper = (ResultSet rs, int rowNum) -> {
        ReviewQuote rq = new ReviewQuote();
        rq.setId(UUID.fromString(rs.getString("id")));
        rq.setThemeId(UUID.fromString(rs.getString("theme_id")));
        rq.setQuote(rs.getString("quote"));
        rq.setOriginalIndex(rs.getInt("original_index"));
        return rq;
    };

    public List<ReviewQuote> findByThemeId(UUID themeId) {
        return jdbcTemplate.query("SELECT * FROM review_quotes WHERE theme_id = ? ORDER BY original_index", rowMapper, themeId);
    }

    public void save(UUID themeId, String quote, int originalIndex) {
        UUID id = UUID.randomUUID();
        jdbcTemplate.update(
            "INSERT INTO review_quotes (id, theme_id, quote, original_index) VALUES (?, ?, ?, ?)",
            id, themeId, quote, originalIndex
        );
    }
}