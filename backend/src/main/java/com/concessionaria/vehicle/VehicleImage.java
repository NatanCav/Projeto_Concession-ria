package com.concessionaria.vehicle;

import com.concessionaria.common.CreatedAtEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vehicle_images")
@Getter
@Setter
public class VehicleImage extends CreatedAtEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
