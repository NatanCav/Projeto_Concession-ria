package com.concessionaria.security;

import com.concessionaria.exception.BusinessRuleException;
import com.concessionaria.user.User;
import com.concessionaria.user.UserRepository;
import com.concessionaria.user.UserRole;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Resolves which store (brand) the authenticated user is allowed to see and change.
 * Administrators are unrestricted; sellers are always pinned to their own store.
 */
@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Usuário não autenticado.");
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Usuário não encontrado."));
    }

    /** @return the seller's brand id, or {@code null} when the user is an administrator. */
    public Long restrictedBrandId() {
        User user = requireCurrentUser();
        if (user.getRole() == UserRole.ADMIN) {
            return null;
        }
        if (user.getBrand() == null) {
            throw new BusinessRuleException(
                    "Seu usuário ainda não está vinculado a nenhuma loja. Peça ao administrador para fazer o vínculo.");
        }
        return user.getBrand().getId();
    }

    public void assertCanManageBrand(Long brandId) {
        Long restricted = restrictedBrandId();
        if (restricted != null && !Objects.equals(restricted, brandId)) {
            throw new AccessDeniedException("Você só pode gerenciar veículos da sua própria loja.");
        }
    }
}
