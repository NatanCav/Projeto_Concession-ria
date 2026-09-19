package com.concessionaria.settings;

import com.concessionaria.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dealership_settings")
@Getter
@Setter
public class DealershipSettings extends BaseEntity {

    @Column(name = "dealership_name", nullable = false, length = 150)
    private String dealershipName;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(nullable = false, length = 20)
    private String whatsapp;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String instagram;

    @Column(length = 200)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 2)
    private String state;

    @Column(name = "opening_hours", length = 200)
    private String openingHours;

    @Column(columnDefinition = "TEXT")
    private String description;
}
