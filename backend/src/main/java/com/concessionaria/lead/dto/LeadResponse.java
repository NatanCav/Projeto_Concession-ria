package com.concessionaria.lead.dto;

import com.concessionaria.lead.ContactLead;

import java.time.Instant;

public record LeadResponse(
        Long id,
        Long vehicleId,
        String vehicleLabel,
        Instant createdAt
) {

    public static LeadResponse from(ContactLead lead) {
        return new LeadResponse(
                lead.getId(),
                lead.getVehicle() != null ? lead.getVehicle().getId() : null,
                lead.getVehicleLabel(),
                lead.getCreatedAt()
        );
    }
}
