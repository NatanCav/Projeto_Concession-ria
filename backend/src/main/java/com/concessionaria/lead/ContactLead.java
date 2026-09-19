package com.concessionaria.lead;

import com.concessionaria.common.CreatedAtEntity;
import com.concessionaria.vehicle.Vehicle;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Records a visitor clicking "Tenho interesse" on a vehicle, right before
 * being redirected to WhatsApp. Kept even if the vehicle is later deleted
 * (vehicleLabel is a denormalized snapshot) so dashboard history stays accurate.
 */
@Entity
@Table(name = "contact_leads")
@Getter
@Setter
public class ContactLead extends CreatedAtEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Column(name = "vehicle_label", nullable = false, length = 255)
    private String vehicleLabel;
}
