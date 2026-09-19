package com.concessionaria.vehicle.dto;

import jakarta.validation.constraints.NotNull;

public record VehicleFeaturedRequest(
        @NotNull(message = "Campo destaque é obrigatório")
        Boolean featured
) {
}
