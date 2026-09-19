package com.concessionaria.vehicle;

import com.concessionaria.brand.Brand;
import com.concessionaria.category.Category;
import com.concessionaria.common.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
public class Vehicle extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 20)
    private VehicleType vehicleType;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false, length = 150)
    private String version;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer mileage;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "promotional_price", precision = 12, scale = 2)
    private BigDecimal promotionalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FuelType fuel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransmissionType transmission;

    @Column(length = 40)
    private String color;

    @Column(name = "license_plate_last_digits", length = 4)
    private String licensePlateLastDigits;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VehicleStatus status = VehicleStatus.DISPONIVEL;

    @Column(nullable = false)
    private boolean featured = false;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @BatchSize(size = 32)
    private List<VehicleImage> images = new ArrayList<>();

    @OneToOne(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private TechnicalSpecification technicalSpecification;
}
