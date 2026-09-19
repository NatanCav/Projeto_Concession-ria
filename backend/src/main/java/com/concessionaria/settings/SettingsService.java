package com.concessionaria.settings;

import com.concessionaria.settings.dto.SettingsRequest;
import com.concessionaria.settings.dto.SettingsResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SettingsService {

    private final DealershipSettingsRepository settingsRepository;

    public SettingsService(DealershipSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    @Transactional
    public SettingsResponse get() {
        return SettingsResponse.from(getOrCreateSingleton());
    }

    @Transactional
    public SettingsResponse update(SettingsRequest request) {
        DealershipSettings settings = getOrCreateSingleton();
        settings.setDealershipName(request.dealershipName());
        settings.setLogoUrl(request.logoUrl());
        settings.setWhatsapp(request.whatsapp());
        settings.setPhone(request.phone());
        settings.setInstagram(request.instagram());
        settings.setAddress(request.address());
        settings.setCity(request.city());
        settings.setState(request.state());
        settings.setOpeningHours(request.openingHours());
        settings.setDescription(request.description());
        return SettingsResponse.from(settingsRepository.save(settings));
    }

    @Transactional
    DealershipSettings getOrCreateSingleton() {
        return settingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> settingsRepository.save(defaultSettings()));
    }

    private DealershipSettings defaultSettings() {
        DealershipSettings settings = new DealershipSettings();
        settings.setDealershipName("Minha Concessionária");
        settings.setWhatsapp("");
        return settings;
    }
}
