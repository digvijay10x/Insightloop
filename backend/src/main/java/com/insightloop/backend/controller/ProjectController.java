package com.insightloop.backend.controller;

import com.insightloop.backend.model.Project;
import com.insightloop.backend.repository.ProjectRepository;
import com.insightloop.backend.repository.AnalysisRepository;
import com.insightloop.backend.repository.ThemeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final AnalysisRepository analysisRepository;
    private final ThemeRepository themeRepository;

    public ProjectController(ProjectRepository projectRepository, AnalysisRepository analysisRepository, ThemeRepository themeRepository) {
        this.projectRepository = projectRepository;
        this.analysisRepository = analysisRepository;
        this.themeRepository = themeRepository;
    }

    @GetMapping
    public List<Project> getAll() {
        return projectRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable UUID id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Project create(@RequestBody Map<String, String> body) {
        return projectRepository.save(body.get("name"), body.get("description"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        projectRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public Map<String, Integer> getStats() {
        return Map.of(
            "totalProjects", projectRepository.findAll().size(),
            "totalAnalyses", analysisRepository.countAll(),
            "totalThemes", themeRepository.countAll()
        );
    }
}