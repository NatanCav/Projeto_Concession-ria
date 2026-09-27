package com.concessionaria.banner.dto;

import com.concessionaria.banner.Banner;

public record BannerResponse(
        Long id,
        String title,
        String subtitle,
        String imageUrl,
        String linkUrl,
        int displayOrder,
        boolean active
) {
    public static BannerResponse from(Banner banner) {
        return new BannerResponse(banner.getId(), banner.getTitle(), banner.getSubtitle(), banner.getImageUrl(),
                banner.getLinkUrl(), banner.getDisplayOrder(), banner.isActive());
    }
}
