package com.concessionaria.vehicle;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {

    @EntityGraph(attributePaths = {"brand", "category", "images", "technicalSpecification"})
    Optional<Vehicle> findBySlug(String slug);

    @Override
    @EntityGraph(attributePaths = {"brand", "category", "images", "technicalSpecification"})
    Optional<Vehicle> findById(Long id);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    long countByStatus(VehicleStatus status);

    long countByFeaturedTrue();

    @Query("select v.slug from Vehicle v where v.status in :statuses order by v.createdAt desc")
    List<String> findSlugsByStatusIn(@Param("statuses") List<VehicleStatus> statuses);

    @EntityGraph(attributePaths = {"brand", "category"})
    List<Vehicle> findByStatusInAndFeaturedTrueOrderByCreatedAtDesc(List<VehicleStatus> statuses,
                                                                     org.springframework.data.domain.Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category"})
    List<Vehicle> findByStatusInOrderByCreatedAtDesc(List<VehicleStatus> statuses,
                                                       org.springframework.data.domain.Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category"})
    @Query("""
            select v from Vehicle v
            where v.status in :statuses
              and v.id <> :excludedId
              and (v.category.id = :categoryId or v.brand.id = :brandId)
              and v.price between :minPrice and :maxPrice
            order by (case when v.category.id = :categoryId then 0 else 1 end), v.createdAt desc
            """)
    List<Vehicle> findRelated(@Param("excludedId") Long excludedId,
                               @Param("categoryId") Long categoryId,
                               @Param("brandId") Long brandId,
                               @Param("minPrice") BigDecimal minPrice,
                               @Param("maxPrice") BigDecimal maxPrice,
                               @Param("statuses") List<VehicleStatus> statuses,
                               org.springframework.data.domain.Pageable pageable);
}
