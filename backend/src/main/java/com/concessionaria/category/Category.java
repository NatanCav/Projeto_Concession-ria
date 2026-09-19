package com.concessionaria.category;

import com.concessionaria.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "categories")
@Getter
@Setter
public class Category extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false)
    private boolean active = true;
}
