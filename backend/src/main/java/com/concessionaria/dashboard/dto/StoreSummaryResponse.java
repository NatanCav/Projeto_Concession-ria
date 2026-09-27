package com.concessionaria.dashboard.dto;

import java.math.BigDecimal;

public record StoreSummaryResponse(
        Long brandId,
        String brandName,
        String logoUrl,
        boolean active,
        long totalVehicles,
        long available,
        long sold,
        long sellers,
        long visitsLast30Days,
        long leads,
        BigDecimal revenue,
        BigDecimal profit
) {
}
