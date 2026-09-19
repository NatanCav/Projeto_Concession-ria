package com.concessionaria.vehicle.dto;

import com.concessionaria.vehicle.VehicleImage;

public record VehicleImageResponse(Long id, String imageUrl, boolean primary, int displayOrder) {

    public static VehicleImageResponse from(VehicleImage image) {
        return new VehicleImageResponse(image.getId(), image.getImageUrl(), image.isPrimary(), image.getDisplayOrder());
    }
}
