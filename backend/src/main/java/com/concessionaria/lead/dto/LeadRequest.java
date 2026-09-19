package com.concessionaria.lead.dto;

import jakarta.validation.constraints.NotNull;

public record LeadRequest(
        @NotNull(message = "Veículo é obrigatório")
        Long vehicleId
) {
}
