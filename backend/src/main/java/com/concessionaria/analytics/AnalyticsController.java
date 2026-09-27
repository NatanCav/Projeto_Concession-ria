package com.concessionaria.analytics;

import com.concessionaria.analytics.dto.PageViewRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Visitas")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @PostMapping("/views")
    public ResponseEntity<Void> recordView(@RequestBody PageViewRequest request) {
        analyticsService.recordView(request);
        return ResponseEntity.noContent().build();
    }
}
