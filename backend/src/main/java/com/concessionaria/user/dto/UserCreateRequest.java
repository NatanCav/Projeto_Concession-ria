package com.concessionaria.user.dto;

import com.concessionaria.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(

        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 150)
        String name,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Size(max = 180)
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
        String password,

        @NotNull(message = "Perfil é obrigatório")
        UserRole role
) {
}
