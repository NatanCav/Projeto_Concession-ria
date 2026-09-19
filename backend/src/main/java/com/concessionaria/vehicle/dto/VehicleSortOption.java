package com.concessionaria.vehicle.dto;

import org.springframework.data.domain.Sort;

/**
 * Whitelist of sort options exposed by the API — keeps the {@code sort}
 * query param decoupled from raw entity property names.
 */
public enum VehicleSortOption {
    RECENTES("recentes"),
    MENOR_PRECO("menor-preco"),
    MAIOR_PRECO("maior-preco"),
    MENOR_KM("menor-km"),
    MAIOR_KM("maior-km");

    private final String param;

    VehicleSortOption(String param) {
        this.param = param;
    }

    public static VehicleSortOption fromParam(String param) {
        if (param == null) {
            return RECENTES;
        }
        for (VehicleSortOption option : values()) {
            if (option.param.equalsIgnoreCase(param)) {
                return option;
            }
        }
        return RECENTES;
    }

    public Sort toSort() {
        return switch (this) {
            case MENOR_PRECO -> Sort.by(Sort.Direction.ASC, "price");
            case MAIOR_PRECO -> Sort.by(Sort.Direction.DESC, "price");
            case MENOR_KM -> Sort.by(Sort.Direction.ASC, "mileage");
            case MAIOR_KM -> Sort.by(Sort.Direction.DESC, "mileage");
            case RECENTES -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
