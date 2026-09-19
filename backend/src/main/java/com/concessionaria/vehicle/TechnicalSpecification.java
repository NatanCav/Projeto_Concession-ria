package com.concessionaria.vehicle;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "technical_specifications")
@Getter
@Setter
public class TechnicalSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false, unique = true)
    private Vehicle vehicle;

    private String engine;

    private String displacement;

    private String horsepower;

    private String torque;

    private String traction;

    @Column(name = "urban_consumption", precision = 5, scale = 1)
    private BigDecimal urbanConsumption;

    @Column(name = "highway_consumption", precision = 5, scale = 1)
    private BigDecimal highwayConsumption;

    @Column(name = "fuel_tank_capacity", precision = 5, scale = 1)
    private BigDecimal fuelTankCapacity;

    private Integer doors;

    private Integer seats;

    @Column(precision = 7, scale = 1)
    private BigDecimal weight;

    @Column(precision = 6, scale = 1)
    private BigDecimal length;

    @Column(precision = 6, scale = 1)
    private BigDecimal width;

    @Column(precision = 6, scale = 1)
    private BigDecimal height;
}
