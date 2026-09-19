package com.concessionaria.vehicle.spec;

import com.concessionaria.vehicle.Vehicle;
import com.concessionaria.vehicle.dto.VehicleFilter;
import jakarta.persistence.criteria.Fetch;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public final class VehicleSpecifications {

    private VehicleSpecifications() {
    }

    @SuppressWarnings("unchecked")
    public static Specification<Vehicle> withFilter(VehicleFilter filter) {
        return (root, query, cb) -> {
            Join<Object, Object> brandJoin;
            boolean isCountQuery = query.getResultType() == Long.class || query.getResultType() == long.class;
            if (!isCountQuery) {
                Fetch<Object, Object> brandFetch = root.fetch("brand", JoinType.LEFT);
                root.fetch("category", JoinType.LEFT);
                brandJoin = (Join<Object, Object>) brandFetch;
                query.distinct(true);
            } else {
                brandJoin = root.join("brand", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (filter.statuses() != null && !filter.statuses().isEmpty()) {
                predicates.add(root.get("status").in(filter.statuses()));
            }
            if (filter.brandId() != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), filter.brandId()));
            }
            if (filter.categoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.categoryId()));
            }
            if (filter.vehicleType() != null) {
                predicates.add(cb.equal(root.get("vehicleType"), filter.vehicleType()));
            }
            if (filter.minYear() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("year"), filter.minYear()));
            }
            if (filter.maxYear() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("year"), filter.maxYear()));
            }
            if (filter.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.minPrice()));
            }
            if (filter.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.maxPrice()));
            }
            if (filter.maxMileage() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("mileage"), filter.maxMileage()));
            }
            if (filter.fuel() != null) {
                predicates.add(cb.equal(root.get("fuel"), filter.fuel()));
            }
            if (filter.transmission() != null) {
                predicates.add(cb.equal(root.get("transmission"), filter.transmission()));
            }
            if (StringUtils.hasText(filter.q())) {
                String like = "%" + filter.q().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("model")), like),
                        cb.like(cb.lower(root.get("version")), like),
                        cb.like(cb.lower(brandJoin.get("name")), like)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
