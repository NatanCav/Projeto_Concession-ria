package com.concessionaria.banner.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BannerOrderRequest(
        @NotNull(message = "Informe a nova ordem dos banners")
        List<Long> ids
) {
}
