package com.concessionaria.banner.dto;

import jakarta.validation.constraints.Size;

public record BannerRequest(
        @Size(max = 120, message = "Título deve ter no máximo 120 caracteres")
        String title,

        @Size(max = 255, message = "Subtítulo deve ter no máximo 255 caracteres")
        String subtitle,

        @Size(max = 500, message = "Link deve ter no máximo 500 caracteres")
        String linkUrl,

        Boolean active
) {
}
