package com.concessionaria.lead;

import com.concessionaria.lead.dto.LeadRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leads")
@Tag(name = "Interesses de contato")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping
    public ResponseEntity<Void> register(@Valid @RequestBody LeadRequest request) {
        leadService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
