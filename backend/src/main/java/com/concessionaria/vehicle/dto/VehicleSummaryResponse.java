package com.concessionaria.vehicle.dto;

import com.concessionaria.vehicle.FuelType;
import com.concessionaria.vehicle.TransmissionType;
import com.concessionaria.vehicle.Vehicle;
import com.concessionaria.vehicle.VehicleImage;
import com.concessionaria.vehicle.VehicleStatus;
import com.concessionaria.vehicle.VehicleType;

import java.math.BigDecimal;
import java.util.Comparator;

public record VehicleSummaryResponse(
        Long id,
        String slug,
        String brandName,
        String categoryName,
        VehicleType vehicleType,
        String model,
        String version,
        Integer year,
        Integer mileage,
        BigDecimal price,
        BigDecimal promotionalPrice,
        FuelType fuel,
        TransmissionType transmission,
        VehicleStatus status,
        boolean featured,
        String primaryImageUrl
) {

    public static VehicleSummaryResponse from(Vehicle vehicle) {
        String primaryImageUrl = vehicle.getImages().stream()
                .min(Comparator.comparing((VehicleImage img) -> !img.isPrimary())
                        .thenComparing(VehicleImage::getDisplayOrder))
                .map(VehicleImage::getImageUrl)
                .orElse(null);

        return new VehicleSummaryResponse(
                vehicle.getId(),
                vehicle.getSlug(),
                vehicle.getBrand().getName(),
                vehicle.getCategory().getName(),
                vehicle.getVehicleType(),
                vehicle.getModel(),
                vehicle.getVersion(),
                vehicle.getYear(),
                vehicle.getMileage(),
                vehicle.getPrice(),
                vehicle.getPromotionalPrice(),
                vehicle.getFuel(),
                vehicle.getTransmission(),
                vehicle.getStatus(),
                vehicle.isFeatured(),
                primaryImageUrl
        );
    }
}
