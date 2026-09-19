package com.concessionaria.vehicle.dto;

import com.concessionaria.vehicle.VehicleStatus;
import jakarta.validation.constraints.NotNull;

public record VehicleStatusRequest(
        @NotNull(message = "Status é obrigatório")
        VehicleStatus status
) {
}
