package com.concessionaria.brand;

import com.concessionaria.brand.dto.BrandRequest;
import com.concessionaria.brand.dto.BrandResponse;
import com.concessionaria.exception.BusinessRuleException;
import com.concessionaria.exception.DuplicateResourceException;
import com.concessionaria.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BrandServiceTest {

    @Mock
    private BrandRepository brandRepository;

    private BrandService brandService;

    @BeforeEach
    void setUp() {
        brandService = new BrandService(brandRepository);
        lenient().when(brandRepository.save(any(Brand.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void create_savesBrand_whenNameIsUnique() {
        when(brandRepository.existsByNameIgnoreCase("Toyota")).thenReturn(false);

        BrandResponse response = brandService.create(new BrandRequest("Toyota", null, null));

        assertThat(response.name()).isEqualTo("Toyota");
        assertThat(response.active()).isTrue();
    }

    @Test
    void create_throwsDuplicateResource_whenNameAlreadyExists() {
        when(brandRepository.existsByNameIgnoreCase("Toyota")).thenReturn(true);

        assertThatThrownBy(() -> brandService.create(new BrandRequest("Toyota", null, null)))
                .isInstanceOf(DuplicateResourceException.class);

        verify(brandRepository, never()).save(any());
    }

    @Test
    void update_throwsDuplicateResource_whenAnotherBrandAlreadyUsesTheName() {
        Brand existing = brandWithId(1L, "Toyota");
        when(brandRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(brandRepository.existsByNameIgnoreCaseAndIdNot("Honda", 1L)).thenReturn(true);

        assertThatThrownBy(() -> brandService.update(1L, new BrandRequest("Honda", null, null)))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void update_throwsResourceNotFound_whenBrandDoesNotExist() {
        when(brandRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> brandService.update(99L, new BrandRequest("Toyota", null, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_removesBrand_whenNoVehiclesLinked() {
        Brand existing = brandWithId(1L, "Toyota");
        when(brandRepository.findById(1L)).thenReturn(Optional.of(existing));

        brandService.delete(1L);

        verify(brandRepository).delete(existing);
    }

    @Test
    void delete_throwsBusinessRule_whenBrandHasLinkedVehicles() {
        Brand existing = brandWithId(1L, "Toyota");
        when(brandRepository.findById(1L)).thenReturn(Optional.of(existing));
        doThrow(new DataIntegrityViolationException("fk violation")).when(brandRepository).flush();

        assertThatThrownBy(() -> brandService.delete(1L))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void findAll_returnsOnlyActiveBrands_whenIncludeInactiveIsFalse() {
        when(brandRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(brandWithId(1L, "Toyota")));

        List<BrandResponse> result = brandService.findAll(false);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Toyota");
    }

    private Brand brandWithId(Long id, String name) {
        Brand brand = new Brand();
        brand.setId(id);
        brand.setName(name);
        brand.setActive(true);
        return brand;
    }
}
