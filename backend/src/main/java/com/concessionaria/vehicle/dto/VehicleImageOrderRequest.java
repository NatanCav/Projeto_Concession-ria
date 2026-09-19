package com.concessionaria.vehicle.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record VehicleImageOrderRequest(
        @NotEmpty(message = "Lista de imagens não pode ser vazia")
        List<Long> imageIds
) {
}
