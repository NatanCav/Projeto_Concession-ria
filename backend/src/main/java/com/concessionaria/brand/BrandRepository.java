package com.concessionaria.brand;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<Brand> findByActiveTrueOrderByNameAsc();
}
