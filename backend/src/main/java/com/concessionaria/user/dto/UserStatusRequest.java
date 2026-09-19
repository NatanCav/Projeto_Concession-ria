package com.concessionaria.user.dto;

import jakarta.validation.constraints.NotNull;

public record UserStatusRequest(
        @NotNull(message = "Campo ativo é obrigatório")
        Boolean active
) {
}
