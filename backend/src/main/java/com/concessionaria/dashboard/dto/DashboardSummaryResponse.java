package com.concessionaria.dashboard.dto;

public record DashboardSummaryResponse(
        long totalVehicles,
        long available,
        long reserved,
        long sold,
        long inactive,
        long featuredCount,
        long totalLeads
) {
}
