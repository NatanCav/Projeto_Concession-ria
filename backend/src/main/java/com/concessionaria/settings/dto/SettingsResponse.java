package com.concessionaria.settings.dto;

import com.concessionaria.settings.DealershipSettings;

public record SettingsResponse(
        String dealershipName,
        String logoUrl,
        String whatsapp,
        String phone,
        String instagram,
        String address,
        String city,
        String state,
        String openingHours,
        String description
) {
    public static SettingsResponse from(DealershipSettings settings) {
        return new SettingsResponse(
                settings.getDealershipName(), settings.getLogoUrl(), settings.getWhatsapp(),
                settings.getPhone(), settings.getInstagram(), settings.getAddress(), settings.getCity(),
                settings.getState(), settings.getOpeningHours(), settings.getDescription()
        );
    }
}
