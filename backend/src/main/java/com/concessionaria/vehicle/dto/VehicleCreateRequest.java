package com.concessionaria.vehicle.dto;

import com.concessionaria.vehicle.FuelType;
import com.concessionaria.vehicle.TransmissionType;
import com.concessionaria.vehicle.VehicleStatus;
import com.concessionaria.vehicle.VehicleType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record VehicleCreateRequest(

        @NotNull(message = "Marca é obrigatória")
        Long brandId,

        @NotNull(message = "Categoria é obrigatória")
        Long categoryId,

        @NotNull(message = "Tipo de veículo é obrigatório")
        VehicleType vehicleType,

        @NotBlank(message = "Modelo é obrigatório")
        @Size(max = 100)
        String model,

        @NotBlank(message = "Versão é obrigatória")
        @Size(max = 150)
        String version,

        @NotNull(message = "Ano é obrigatório")
        @Min(value = 1950, message = "Ano inválido")
        @Max(value = 2100, message = "Ano inválido")
        Integer year,

        @NotNull(message = "Quilometragem é obrigatória")
        @PositiveOrZero(message = "Quilometragem não pode ser negativa")
        Integer mileage,

        @NotNull(message = "Preço é obrigatório")
        @Positive(message = "Preço deve ser maior que zero")
        BigDecimal price,

        @PositiveOrZero(message = "Preço promocional não pode ser negativo")
        BigDecimal promotionalPrice,

        @NotNull(message = "Combustível é obrigatório")
        FuelType fuel,

        @NotNull(message = "Câmbio é obrigatório")
        TransmissionType transmission,

        @Size(max = 40)
        String color,

        @Size(max = 4, message = "Informe apenas os últimos dígitos da placa")
        String licensePlateLastDigits,

        String description,

        VehicleStatus status,

        Boolean featured,

        @Valid
        TechnicalSpecificationRequest specifications
) {
}
