package com.concessionaria.vehicle.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

public record TechnicalSpecificationRequest(
        String engine,
        String displacement,
        String horsepower,
        String torque,
        String traction,

        @DecimalMin(value = "0", inclusive = true, message = "Consumo urbano não pode ser negativo")
        BigDecimal urbanConsumption,

        @DecimalMin(value = "0", inclusive = true, message = "Consumo rodoviário não pode ser negativo")
        BigDecimal highwayConsumption,

        @DecimalMin(value = "0", inclusive = true, message = "Capacidade do tanque não pode ser negativa")
        BigDecimal fuelTankCapacity,

        @Min(value = 0, message = "Número de portas inválido")
        @Max(value = 10, message = "Número de portas inválido")
        Integer doors,

        @Min(value = 0, message = "Número de lugares inválido")
        @Max(value = 60, message = "Número de lugares inválido")
        Integer seats,

        @DecimalMin(value = "0", inclusive = true, message = "Peso não pode ser negativo")
        BigDecimal weight,

        @DecimalMin(value = "0", inclusive = true, message = "Comprimento não pode ser negativo")
        BigDecimal length,

        @DecimalMin(value = "0", inclusive = true, message = "Largura não pode ser negativa")
        BigDecimal width,

        @DecimalMin(value = "0", inclusive = true, message = "Altura não pode ser negativa")
        BigDecimal height
) {
}
