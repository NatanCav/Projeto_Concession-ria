package com.concessionaria.settings;

import com.concessionaria.settings.dto.SettingsRequest;
import com.concessionaria.settings.dto.SettingsResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Configurações da concessionária")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public SettingsResponse get() {
        return settingsService.get();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SettingsResponse update(@Valid @RequestBody SettingsRequest request) {
        return settingsService.update(request);
    }
}
