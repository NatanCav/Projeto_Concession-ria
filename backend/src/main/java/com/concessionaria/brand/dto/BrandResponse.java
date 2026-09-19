package com.concessionaria.brand.dto;

import com.concessionaria.brand.Brand;

public record BrandResponse(Long id, String name, String logoUrl, boolean active) {

    public static BrandResponse from(Brand brand) {
        return new BrandResponse(brand.getId(), brand.getName(), brand.getLogoUrl(), brand.isActive());
    }
}
