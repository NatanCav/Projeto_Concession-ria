package com.concessionaria.vehicle;

import com.concessionaria.brand.Brand;
import com.concessionaria.brand.BrandRepository;
import com.concessionaria.category.Category;
import com.concessionaria.category.CategoryRepository;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.storage.FileStorageService;
import com.concessionaria.vehicle.dto.TechnicalSpecificationRequest;
import com.concessionaria.vehicle.dto.VehicleCreateRequest;
import com.concessionaria.vehicle.dto.VehicleDetailResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private FileStorageService fileStorageService;

    private VehicleService vehicleService;

    private Brand toyota;
    private Category sedan;

    @BeforeEach
    void setUp() {
        vehicleService = new VehicleService(vehicleRepository, brandRepository, categoryRepository, fileStorageService);

        toyota = new Brand();
        toyota.setId(1L);
        toyota.setName("Toyota");

        sedan = new Category();
        sedan.setId(1L);
        sedan.setName("Sedan");

        // save() echoes back whatever entity it receives, as a real JPA repository would.
        lenient().when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private VehicleCreateRequest createRequest() {
        return new VehicleCreateRequest(
                1L, 1L, VehicleType.CARRO, "Corolla", "XEi 2.0", 2023, 15000,
                BigDecimal.valueOf(129900), null, FuelType.FLEX, TransmissionType.AUTOMATICO,
                "Prata", null, "Único dono", null, null, null
        );
    }

    @Test
    void create_generatesSlugFromBrandModelVersionAndYear_whenAvailable() {
        when(brandRepository.findById(1L)).thenReturn(Optional.of(toyota));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sedan));
        when(vehicleRepository.existsBySlug("toyota-corolla-xei-20-2023")).thenReturn(false);

        VehicleDetailResponse response = vehicleService.create(createRequest());

        assertThat(response.slug()).isEqualTo("toyota-corolla-xei-20-2023");
    }

    @Test
    void create_appendsNumericSuffix_whenSlugAlreadyTaken() {
        when(brandRepository.findById(1L)).thenReturn(Optional.of(toyota));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sedan));
        when(vehicleRepository.existsBySlug("toyota-corolla-xei-20-2023")).thenReturn(true);
        when(vehicleRepository.existsBySlug("toyota-corolla-xei-20-2023-2")).thenReturn(false);

        VehicleDetailResponse response = vehicleService.create(createRequest());

        assertThat(response.slug()).isEqualTo("toyota-corolla-xei-20-2023-2");
    }

    @Test
    void create_defaultsStatusToDisponivel_whenStatusNotProvided() {
        when(brandRepository.findById(1L)).thenReturn(Optional.of(toyota));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sedan));
        when(vehicleRepository.existsBySlug(any())).thenReturn(false);

        VehicleDetailResponse response = vehicleService.create(createRequest());

        assertThat(response.status()).isEqualTo(VehicleStatus.DISPONIVEL);
        assertThat(response.featured()).isFalse();
    }

    @Test
    void create_throwsResourceNotFound_whenBrandDoesNotExist() {
        when(brandRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.create(createRequest()))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(vehicleRepository, never()).save(any());
    }

    @Test
    void create_throwsResourceNotFound_whenCategoryDoesNotExist() {
        when(brandRepository.findById(1L)).thenReturn(Optional.of(toyota));
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.create(createRequest()))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(vehicleRepository, never()).save(any());
    }

    @Test
    void create_savesTechnicalSpecification_whenProvided() {
        when(brandRepository.findById(1L)).thenReturn(Optional.of(toyota));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sedan));
        when(vehicleRepository.existsBySlug(any())).thenReturn(false);

        TechnicalSpecificationRequest specRequest = new TechnicalSpecificationRequest(
                "2.0 16V", "2.0L", "177 cv", "21,1 kgfm", "Dianteira",
                BigDecimal.valueOf(9.8), BigDecimal.valueOf(13.4), BigDecimal.valueOf(50),
                4, 5, BigDecimal.valueOf(1345), BigDecimal.valueOf(4630), BigDecimal.valueOf(1780), BigDecimal.valueOf(1435));

        VehicleCreateRequest request = new VehicleCreateRequest(
                1L, 1L, VehicleType.CARRO, "Corolla", "XEi 2.0", 2023, 15000,
                BigDecimal.valueOf(129900), null, FuelType.FLEX, TransmissionType.AUTOMATICO,
                "Prata", null, "Único dono", null, null, specRequest
        );

        VehicleDetailResponse response = vehicleService.create(request);

        assertThat(response.specifications()).isNotNull();
        assertThat(response.specifications().engine()).isEqualTo("2.0 16V");
        assertThat(response.specifications().horsepower()).isEqualTo("177 cv");
    }

    @Test
    void update_regeneratesSlug_whenModelChanges() {
        Vehicle existing = existingVehicle("toyota-corolla-xei-2022", "Corolla", "XEi 2.0", 2023);

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(brandRepository.findById(1L)).thenReturn(Optional.of(toyota));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sedan));
        when(vehicleRepository.existsBySlugAndIdNot(eq("toyota-corolla-altis-20-2023"), eq(10L))).thenReturn(false);

        VehicleCreateRequest request = new VehicleCreateRequest(
                1L, 1L, VehicleType.CARRO, "Corolla", "Altis 2.0", 2023, 15000,
                BigDecimal.valueOf(129900), null, FuelType.FLEX, TransmissionType.AUTOMATICO,
                "Prata", null, null, null, null, null
        );

        VehicleDetailResponse response = vehicleService.update(10L, request);

        assertThat(response.slug()).isEqualTo("toyota-corolla-altis-20-2023");
    }

    @Test
    void update_keepsExistingSlug_whenModelBrandVersionAndYearUnchanged() {
        Vehicle existing = existingVehicle("toyota-corolla-xei-20-2023", "Corolla", "XEi 2.0", 2023);

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(brandRepository.findById(1L)).thenReturn(Optional.of(toyota));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sedan));

        // Only the price changes; brand/model/version/year stay the same.
        VehicleCreateRequest request = new VehicleCreateRequest(
                1L, 1L, VehicleType.CARRO, "Corolla", "XEi 2.0", 2023, 15000,
                BigDecimal.valueOf(119900), null, FuelType.FLEX, TransmissionType.AUTOMATICO,
                "Prata", null, null, null, null, null
        );

        VehicleDetailResponse response = vehicleService.update(10L, request);

        assertThat(response.slug()).isEqualTo("toyota-corolla-xei-20-2023");
        assertThat(response.price()).isEqualByComparingTo(BigDecimal.valueOf(119900));
        verify(vehicleRepository, never()).existsBySlugAndIdNot(any(), anyLong());
    }

    @Test
    void update_throwsResourceNotFound_whenVehicleDoesNotExist() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.update(99L, createRequest()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateStatus_changesVehicleStatus() {
        Vehicle existing = existingVehicle("toyota-corolla-xei-20-2023", "Corolla", "XEi 2.0", 2023);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(existing));

        VehicleDetailResponse response = vehicleService.updateStatus(10L, VehicleStatus.VENDIDO);

        assertThat(response.status()).isEqualTo(VehicleStatus.VENDIDO);
    }

    @Test
    void updateFeatured_togglesFeaturedFlag() {
        Vehicle existing = existingVehicle("toyota-corolla-xei-20-2023", "Corolla", "XEi 2.0", 2023);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(existing));

        VehicleDetailResponse response = vehicleService.updateFeatured(10L, true);

        assertThat(response.featured()).isTrue();
    }

    @Test
    void getPublicDetailBySlug_throwsResourceNotFound_whenVehicleIsSold() {
        Vehicle sold = existingVehicle("toyota-corolla-xei-20-2023", "Corolla", "XEi 2.0", 2023);
        sold.setStatus(VehicleStatus.VENDIDO);
        when(vehicleRepository.findBySlug("toyota-corolla-xei-20-2023")).thenReturn(Optional.of(sold));

        assertThatThrownBy(() -> vehicleService.getPublicDetailBySlug("toyota-corolla-xei-20-2023"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getPublicDetailBySlug_returnsVehicle_whenAvailable() {
        Vehicle available = existingVehicle("toyota-corolla-xei-20-2023", "Corolla", "XEi 2.0", 2023);
        available.setStatus(VehicleStatus.DISPONIVEL);
        when(vehicleRepository.findBySlug("toyota-corolla-xei-20-2023")).thenReturn(Optional.of(available));

        VehicleDetailResponse response = vehicleService.getPublicDetailBySlug("toyota-corolla-xei-20-2023");

        assertThat(response.slug()).isEqualTo("toyota-corolla-xei-20-2023");
    }

    @Test
    void getPublicDetailBySlug_returnsVehicle_whenReserved() {
        Vehicle reserved = existingVehicle("toyota-corolla-xei-20-2023", "Corolla", "XEi 2.0", 2023);
        reserved.setStatus(VehicleStatus.RESERVADO);
        when(vehicleRepository.findBySlug("toyota-corolla-xei-20-2023")).thenReturn(Optional.of(reserved));

        VehicleDetailResponse response = vehicleService.getPublicDetailBySlug("toyota-corolla-xei-20-2023");

        assertThat(response.status()).isEqualTo(VehicleStatus.RESERVADO);
    }

    @Test
    void delete_removesEachImageFileBeforeDeletingVehicle() {
        Vehicle existing = existingVehicle("toyota-corolla-xei-20-2023", "Corolla", "XEi 2.0", 2023);
        VehicleImage image1 = new VehicleImage();
        image1.setStoragePath("vehicles/10/a.jpg");
        VehicleImage image2 = new VehicleImage();
        image2.setStoragePath("vehicles/10/b.jpg");
        existing.getImages().add(image1);
        existing.getImages().add(image2);

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(existing));

        vehicleService.delete(10L);

        verify(fileStorageService, times(1)).delete("vehicles/10/a.jpg");
        verify(fileStorageService, times(1)).delete("vehicles/10/b.jpg");
        verify(vehicleRepository).delete(existing);
    }

    @Test
    void delete_throwsResourceNotFound_whenVehicleDoesNotExist() {
        when(vehicleRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.delete(404L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(vehicleRepository, never()).delete(any(Vehicle.class));
    }

    private Vehicle existingVehicle(String slug, String model, String version, int year) {
        Vehicle vehicle = new Vehicle();
        vehicle.setId(10L);
        vehicle.setBrand(toyota);
        vehicle.setCategory(sedan);
        vehicle.setVehicleType(VehicleType.CARRO);
        vehicle.setModel(model);
        vehicle.setVersion(version);
        vehicle.setYear(year);
        vehicle.setMileage(15000);
        vehicle.setPrice(BigDecimal.valueOf(129900));
        vehicle.setFuel(FuelType.FLEX);
        vehicle.setTransmission(TransmissionType.AUTOMATICO);
        vehicle.setStatus(VehicleStatus.DISPONIVEL);
        vehicle.setFeatured(false);
        vehicle.setSlug(slug);
        return vehicle;
    }
}
