package com.concessionaria.settings.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SettingsRequest(

        @NotBlank(message = "Nome da concessionária é obrigatório")
        @Size(max = 150)
        String dealershipName,

        String logoUrl,

        @NotBlank(message = "WhatsApp é obrigatório")
        @Size(max = 20)
        String whatsapp,

        @Size(max = 20)
        String phone,

        @Size(max = 100)
        String instagram,

        @Size(max = 200)
        String address,

        @Size(max = 100)
        String city,

        @Size(max = 2, message = "Use a sigla do estado (ex.: SP)")
        String state,

        @Size(max = 200)
        String openingHours,

        String description
) {
}
