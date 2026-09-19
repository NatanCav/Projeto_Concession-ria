package com.concessionaria.vehicle.dto;

import com.concessionaria.vehicle.TechnicalSpecification;

import java.math.BigDecimal;

public record TechnicalSpecificationResponse(
        String engine,
        String displacement,
        String horsepower,
        String torque,
        String traction,
        BigDecimal urbanConsumption,
        BigDecimal highwayConsumption,
        BigDecimal fuelTankCapacity,
        Integer doors,
        Integer seats,
        BigDecimal weight,
        BigDecimal length,
        BigDecimal width,
        BigDecimal height
) {
    public static TechnicalSpecificationResponse from(TechnicalSpecification spec) {
        if (spec == null) {
            return null;
        }
        return new TechnicalSpecificationResponse(
                spec.getEngine(), spec.getDisplacement(), spec.getHorsepower(), spec.getTorque(),
                spec.getTraction(), spec.getUrbanConsumption(), spec.getHighwayConsumption(),
                spec.getFuelTankCapacity(), spec.getDoors(), spec.getSeats(), spec.getWeight(),
                spec.getLength(), spec.getWidth(), spec.getHeight()
        );
    }
}
