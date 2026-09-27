package com.concessionaria.vehicle.dto;

import com.concessionaria.brand.dto.BrandResponse;
import com.concessionaria.category.dto.CategoryResponse;
import com.concessionaria.vehicle.FuelType;
import com.concessionaria.vehicle.TransmissionType;
import com.concessionaria.vehicle.Vehicle;
import com.concessionaria.vehicle.VehicleStatus;
import com.concessionaria.vehicle.VehicleType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record VehicleDetailResponse(
        Long id,
        String slug,
        BrandResponse brand,
        CategoryResponse category,
        VehicleType vehicleType,
        String model,
        String version,
        Integer year,
        Integer mileage,
        BigDecimal price,
        BigDecimal promotionalPrice,
        BigDecimal costPrice,
        BigDecimal soldPrice,
        Instant soldAt,
        FuelType fuel,
        TransmissionType transmission,
        String color,
        String licensePlateLastDigits,
        String description,
        VehicleStatus status,
        boolean featured,
        List<VehicleImageResponse> images,
        TechnicalSpecificationResponse specifications,
        Instant createdAt
) {

    /** Same as {@link #from} but without internal financial data (cost, sale price). */
    public static VehicleDetailResponse publicFrom(Vehicle vehicle) {
        return build(vehicle, false);
    }

    public static VehicleDetailResponse from(Vehicle vehicle) {
        return build(vehicle, true);
    }

    private static VehicleDetailResponse build(Vehicle vehicle, boolean includeFinancials) {
        List<VehicleImageResponse> images = vehicle.getImages().stream()
                .sorted(Comparator.comparing(img -> img.getDisplayOrder()))
                .map(VehicleImageResponse::from)
                .toList();

        return new VehicleDetailResponse(
                vehicle.getId(),
                vehicle.getSlug(),
                BrandResponse.from(vehicle.getBrand()),
                CategoryResponse.from(vehicle.getCategory()),
                vehicle.getVehicleType(),
                vehicle.getModel(),
                vehicle.getVersion(),
                vehicle.getYear(),
                vehicle.getMileage(),
                vehicle.getPrice(),
                vehicle.getPromotionalPrice(),
                includeFinancials ? vehicle.getCostPrice() : null,
                includeFinancials ? vehicle.getSoldPrice() : null,
                includeFinancials ? vehicle.getSoldAt() : null,
                vehicle.getFuel(),
                vehicle.getTransmission(),
                vehicle.getColor(),
                vehicle.getLicensePlateLastDigits(),
                vehicle.getDescription(),
                vehicle.getStatus(),
                vehicle.isFeatured(),
                images,
                TechnicalSpecificationResponse.from(vehicle.getTechnicalSpecification()),
                vehicle.getCreatedAt()
        );
    }
}
