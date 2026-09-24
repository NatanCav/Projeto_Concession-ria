package com.concessionaria.lead;

import com.concessionaria.brand.Brand;
import com.concessionaria.brand.BrandRepository;
import com.concessionaria.category.Category;
import com.concessionaria.category.CategoryRepository;
import com.concessionaria.vehicle.FuelType;
import com.concessionaria.vehicle.TransmissionType;
import com.concessionaria.vehicle.Vehicle;
import com.concessionaria.vehicle.VehicleRepository;
import com.concessionaria.vehicle.VehicleStatus;
import com.concessionaria.vehicle.VehicleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies {@link ContactLeadRepository#findAllByOrderByCreatedAtDesc} against a
 * real PostgreSQL instance (same engine as {@code VehicleRepositoryTest}), since
 * ordering/pagination behavior depends on the actual database rather than
 * Hibernate's in-memory defaults.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ContactLeadRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ContactLeadRepository contactLeadRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private Vehicle vehicle;

    @BeforeEach
    void setUp() throws InterruptedException {
        Brand brand = brandRepository.save(brand("Toyota"));
        Category category = categoryRepository.save(category("Sedan"));
        vehicle = vehicleRepository.save(vehicle(brand, category, "corolla-xei-2023"));

        // Small delay between inserts so createdAt (set via @PrePersist) is strictly
        // increasing — needed for the "most recent first" assertion to be deterministic.
        contactLeadRepository.save(lead(vehicle, "Toyota Corolla XEi 2023 — 1º"));
        Thread.sleep(5);
        contactLeadRepository.save(lead(vehicle, "Toyota Corolla XEi 2023 — 2º"));
        Thread.sleep(5);
        contactLeadRepository.save(lead(vehicle, "Toyota Corolla XEi 2023 — 3º"));
    }

    @Test
    void findAllByOrderByCreatedAtDesc_returnsMostRecentFirst() {
        Page<ContactLead> page = contactLeadRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(3);
        assertThat(page.getContent().get(0).getVehicleLabel()).isEqualTo("Toyota Corolla XEi 2023 — 3º");
        assertThat(page.getContent().get(2).getVehicleLabel()).isEqualTo("Toyota Corolla XEi 2023 — 1º");
    }

    @Test
    void findAllByOrderByCreatedAtDesc_respectsPageSizeAndReportsTotalElements() {
        Page<ContactLead> page = contactLeadRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 2));

        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getTotalElements()).isEqualTo(3);
        assertThat(page.getTotalPages()).isEqualTo(2);
    }

    @Test
    void findAllByOrderByCreatedAtDesc_keepsVehicleIdAccessibleWithoutFetchingVehicle() {
        Page<ContactLead> page = contactLeadRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10));

        assertThat(page.getContent()).allMatch(l -> l.getVehicle().getId().equals(vehicle.getId()));
    }

    private Brand brand(String name) {
        Brand brand = new Brand();
        brand.setName(name);
        brand.setActive(true);
        return brand;
    }

    private Category category(String name) {
        Category category = new Category();
        category.setName(name);
        category.setActive(true);
        return category;
    }

    private Vehicle vehicle(Brand brand, Category category, String slug) {
        Vehicle vehicle = new Vehicle();
        vehicle.setBrand(brand);
        vehicle.setCategory(category);
        vehicle.setVehicleType(VehicleType.CARRO);
        vehicle.setModel("Corolla");
        vehicle.setVersion("XEi");
        vehicle.setYear(2023);
        vehicle.setMileage(15000);
        vehicle.setPrice(new BigDecimal("129900"));
        vehicle.setFuel(FuelType.FLEX);
        vehicle.setTransmission(TransmissionType.AUTOMATICO);
        vehicle.setStatus(VehicleStatus.DISPONIVEL);
        vehicle.setFeatured(false);
        vehicle.setSlug(slug);
        return vehicle;
    }

    private ContactLead lead(Vehicle vehicle, String label) {
        ContactLead lead = new ContactLead();
        lead.setVehicle(vehicle);
        lead.setVehicleLabel(label);
        return lead;
    }
}
