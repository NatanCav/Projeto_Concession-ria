package com.concessionaria.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DashboardSummaryResponse(
        Long brandId,
        String brandName,
        long totalVehicles,
        long available,
        long reserved,
        long sold,
        long inactive,
        long featuredCount,
        long totalLeads,
        long visitsLast30Days,
        List<DailyCount> visitsByDay,
        List<TopVehicle> topVehicles,
        Financials financials
) {

    public record DailyCount(LocalDate date, long count) {
    }

    public record TopVehicle(Long id, String label, String slug, long views) {
    }

    /**
     * @param revenue         sum of sale prices of sold vehicles
     * @param profit          sale price minus cost, only for sold vehicles that have a cost registered
     * @param stockValue      advertised price of vehicles still for sale (available + reserved)
     * @param soldWithoutCost sold vehicles left out of {@code profit} because no cost was registered
     */
    public record Financials(
            BigDecimal revenue,
            BigDecimal profit,
            BigDecimal stockValue,
            long soldCount,
            long soldWithoutCost,
            BigDecimal revenueLast30Days,
            long soldLast30Days
    ) {
    }
}
