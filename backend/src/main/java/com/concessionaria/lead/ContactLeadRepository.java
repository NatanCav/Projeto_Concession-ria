package com.concessionaria.lead;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ContactLeadRepository extends JpaRepository<ContactLead, Long> {

    Page<ContactLead> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<ContactLead> findByVehicleBrandIdOrderByCreatedAtDesc(Long brandId, Pageable pageable);

    long countByVehicleBrandId(Long brandId);

    @Query("select l.vehicle.brand.id, count(l) from ContactLead l where l.vehicle is not null group by l.vehicle.brand.id")
    List<Object[]> countByBrand();
}
