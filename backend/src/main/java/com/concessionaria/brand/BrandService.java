package com.concessionaria.brand;

import com.concessionaria.brand.dto.BrandRequest;
import com.concessionaria.brand.dto.BrandResponse;
import com.concessionaria.exception.BusinessRuleException;
import com.concessionaria.exception.DuplicateResourceException;
import com.concessionaria.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public List<BrandResponse> findAll(boolean includeInactive) {
        List<Brand> brands = includeInactive
                ? brandRepository.findAll(org.springframework.data.domain.Sort.by("name"))
                : brandRepository.findByActiveTrueOrderByNameAsc();
        return brands.stream().map(BrandResponse::from).toList();
    }

    public BrandResponse findById(Long id) {
        return BrandResponse.from(getOrThrow(id));
    }

    @Transactional
    public BrandResponse create(BrandRequest request) {
        if (brandRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Já existe uma marca com este nome.");
        }
        Brand brand = new Brand();
        applyRequest(brand, request);
        return BrandResponse.from(brandRepository.save(brand));
    }

    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = getOrThrow(id);
        if (brandRepository.existsByNameIgnoreCaseAndIdNot(request.name(), id)) {
            throw new DuplicateResourceException("Já existe uma marca com este nome.");
        }
        applyRequest(brand, request);
        return BrandResponse.from(brandRepository.save(brand));
    }

    @Transactional
    public void delete(Long id) {
        Brand brand = getOrThrow(id);
        try {
            brandRepository.delete(brand);
            brandRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new BusinessRuleException("Não é possível excluir uma marca com veículos vinculados.");
        }
    }

    private void applyRequest(Brand brand, BrandRequest request) {
        brand.setName(request.name());
        brand.setLogoUrl(request.logoUrl());
        if (request.active() != null) {
            brand.setActive(request.active());
        }
    }

    private Brand getOrThrow(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Marca", id));
    }
}
