package com.concessionaria.vehicle.dto;

import com.concessionaria.vehicle.FuelType;
import com.concessionaria.vehicle.TransmissionType;
import com.concessionaria.vehicle.VehicleStatus;
import com.concessionaria.vehicle.VehicleType;

import java.math.BigDecimal;
import java.util.Set;

/**
 * Internal representation of every supported catalog filter. Built by the
 * controller from query params; {@code statuses} is always set server-side
 * (public callers never get to choose it directly).
 */
public record VehicleFilter(
        Long brandId,
        Long categoryId,
        VehicleType vehicleType,
        Integer minYear,
        Integer maxYear,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Integer maxMileage,
        FuelType fuel,
        TransmissionType transmission,
        String q,
        Set<VehicleStatus> statuses
) {
}
