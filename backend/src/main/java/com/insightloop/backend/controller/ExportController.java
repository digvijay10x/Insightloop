package com.insightloop.backend.controller;

import com.insightloop.backend.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/{analysisId}/csv")
    public ResponseEntity<byte[]> exportCsv(@PathVariable UUID analysisId) {
        String csv = exportService.exportCsv(analysisId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=analysis-report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }

    @GetMapping("/{analysisId}/markdown")
    public ResponseEntity<byte[]> exportMarkdown(@PathVariable UUID analysisId) {
        String md = exportService.exportMarkdown(analysisId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=analysis-report.md")
                .contentType(MediaType.parseMediaType("text/markdown"))
                .body(md.getBytes());
    }
}