package com.concessionaria.banner;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findAllByOrderByDisplayOrderAscIdAsc();

    List<Banner> findByActiveTrueOrderByDisplayOrderAscIdAsc();
}
