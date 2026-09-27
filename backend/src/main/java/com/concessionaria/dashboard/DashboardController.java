package com.concessionaria.dashboard;

import com.concessionaria.dashboard.dto.DashboardSummaryResponse;
import com.concessionaria.dashboard.dto.StoreSummaryResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
@Tag(name = "Dashboard administrativo")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary(@RequestParam(required = false) Long brandId) {
        return dashboardService.summary(brandId);
    }

    @GetMapping("/stores")
    @PreAuthorize("hasRole('ADMIN')")
    public List<StoreSummaryResponse> stores() {
        return dashboardService.stores();
    }
}
