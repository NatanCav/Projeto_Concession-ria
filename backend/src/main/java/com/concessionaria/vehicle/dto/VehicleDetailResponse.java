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

    public static VehicleDetailResponse from(Vehicle vehicle) {
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
