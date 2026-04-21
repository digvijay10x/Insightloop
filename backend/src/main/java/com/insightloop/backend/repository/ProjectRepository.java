package com.insightloop.backend.repository;

import com.insightloop.backend.model.Project;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ProjectRepository {

    private final JdbcTemplate jdbcTemplate;

    public ProjectRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Project> rowMapper = (ResultSet rs, int rowNum) -> {
        Project p = new Project();
        p.setId(UUID.fromString(rs.getString("id")));
        p.setName(rs.getString("name"));
        p.setDescription(rs.getString("description"));
        p.setCreatedAt(rs.getObject("created_at", java.time.OffsetDateTime.class));
        return p;
    };

    public List<Project> findAll() {
        return jdbcTemplate.query("SELECT * FROM projects ORDER BY created_at DESC", rowMapper);
    }

    public Optional<Project> findById(UUID id) {
        List<Project> results = jdbcTemplate.query("SELECT * FROM projects WHERE id = ?", rowMapper, id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Project save(String name, String description) {
        UUID id = UUID.randomUUID();
        jdbcTemplate.update("INSERT INTO projects (id, name, description) VALUES (?, ?, ?)", id, name, description);
        return findById(id).orElseThrow();
    }

    public void deleteById(UUID id) {
        jdbcTemplate.update("DELETE FROM projects WHERE id = ?", id);
    }
}