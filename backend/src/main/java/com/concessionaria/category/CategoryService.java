package com.concessionaria.category;

import com.concessionaria.category.dto.CategoryRequest;
import com.concessionaria.category.dto.CategoryResponse;
import com.concessionaria.exception.BusinessRuleException;
import com.concessionaria.exception.DuplicateResourceException;
import com.concessionaria.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> findAll(boolean includeInactive) {
        List<Category> categories = includeInactive
                ? categoryRepository.findAll(Sort.by("name"))
                : categoryRepository.findByActiveTrueOrderByNameAsc();
        return categories.stream().map(CategoryResponse::from).toList();
    }

    public CategoryResponse findById(Long id) {
        return CategoryResponse.from(getOrThrow(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Já existe uma categoria com este nome.");
        }
        Category category = new Category();
        applyRequest(category, request);
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = getOrThrow(id);
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.name(), id)) {
            throw new DuplicateResourceException("Já existe uma categoria com este nome.");
        }
        applyRequest(category, request);
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = getOrThrow(id);
        try {
            categoryRepository.delete(category);
            categoryRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new BusinessRuleException("Não é possível excluir uma categoria com veículos vinculados.");
        }
    }

    private void applyRequest(Category category, CategoryRequest request) {
        category.setName(request.name());
        if (request.active() != null) {
            category.setActive(request.active());
        }
    }

    private Category getOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Categoria", id));
    }
}
