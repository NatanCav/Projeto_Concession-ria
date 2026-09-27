package com.concessionaria.user;

import com.concessionaria.brand.Brand;
import com.concessionaria.brand.BrandRepository;
import com.concessionaria.exception.BusinessRuleException;
import com.concessionaria.exception.DuplicateResourceException;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.user.dto.UserCreateRequest;
import com.concessionaria.user.dto.UserResponse;
import com.concessionaria.user.dto.UserUpdateRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final BrandRepository brandRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BrandRepository brandRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.brandRepository = brandRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public UserResponse findById(Long id) {
        return UserResponse.from(getOrThrow(id));
    }

    @Transactional
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("Já existe um usuário com este e-mail.");
        }
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role());
        user.setBrand(resolveStore(request.role(), request.brandId()));
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setActive(true);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = getOrThrow(id);
        if (userRepository.findByEmailIgnoreCase(request.email())
                .filter(existing -> !existing.getId().equals(id))
                .isPresent()) {
            throw new DuplicateResourceException("Já existe um usuário com este e-mail.");
        }
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role());
        user.setBrand(resolveStore(request.role(), request.brandId()));
        if (StringUtils.hasText(request.password())) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse changeStatus(Long id, boolean active) {
        User user = getOrThrow(id);
        user.setActive(active);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        User user = getOrThrow(id);
        userRepository.delete(user);
    }

    private Brand resolveStore(UserRole role, Long brandId) {
        if (role == UserRole.ADMIN) {
            return null;
        }
        if (brandId == null) {
            throw new BusinessRuleException("Selecione a loja (marca) que este vendedor vai representar.");
        }
        return brandRepository.findById(brandId)
                .orElseThrow(() -> ResourceNotFoundException.of("Marca", brandId));
    }

    private User getOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", id));
    }
}
