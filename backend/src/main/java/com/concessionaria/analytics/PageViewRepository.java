package com.concessionaria.analytics;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface PageViewRepository extends JpaRepository<PageView, Long> {

    long countByCreatedAtGreaterThanEqual(Instant since);

    long countByBrandIdAndCreatedAtGreaterThanEqual(Long brandId, Instant since);

    @Query(value = """
            select cast(created_at as date) as day, count(*) as total
            from page_views
            where created_at >= :since
            group by cast(created_at as date)
            """, nativeQuery = true)
    List<Object[]> countDaily(@Param("since") Instant since);

    @Query(value = """
            select cast(created_at as date) as day, count(*) as total
            from page_views
            where created_at >= :since and brand_id = :brandId
            group by cast(created_at as date)
            """, nativeQuery = true)
    List<Object[]> countDailyForBrand(@Param("brandId") Long brandId, @Param("since") Instant since);

    @Query("""
            select pv.vehicle.id, count(pv) from PageView pv
            where pv.vehicle is not null and pv.createdAt >= :since
            group by pv.vehicle.id
            order by count(pv) desc
            """)
    List<Object[]> topVehicles(@Param("since") Instant since, Pageable pageable);

    @Query("""
            select pv.vehicle.id, count(pv) from PageView pv
            where pv.vehicle is not null and pv.createdAt >= :since and pv.brand.id = :brandId
            group by pv.vehicle.id
            order by count(pv) desc
            """)
    List<Object[]> topVehiclesForBrand(@Param("brandId") Long brandId, @Param("since") Instant since,
                                       Pageable pageable);

    @Query("select pv.brand.id, count(pv) from PageView pv where pv.createdAt >= :since group by pv.brand.id")
    List<Object[]> countByBrandSince(@Param("since") Instant since);
}
