package com.concessionaria.vehicle;

import java.util.Set;

public enum VehicleStatus {
    DISPONIVEL,
    RESERVADO,
    VENDIDO,
    INATIVO;

    /** Statuses visible to anonymous visitors browsing the public catalog. */
    public static final Set<VehicleStatus> PUBLICLY_VISIBLE = Set.of(DISPONIVEL, RESERVADO);
}
