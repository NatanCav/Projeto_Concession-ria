package com.concessionaria.vehicle;

import com.concessionaria.brand.Brand;
import com.concessionaria.brand.BrandRepository;
import com.concessionaria.category.Category;
import com.concessionaria.category.CategoryRepository;
import com.concessionaria.common.PageResponse;
import com.concessionaria.common.SlugUtils;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.storage.FileStorageService;
import com.concessionaria.vehicle.dto.TechnicalSpecificationRequest;
import com.concessionaria.vehicle.dto.VehicleCreateRequest;
import com.concessionaria.vehicle.dto.VehicleDetailResponse;
import com.concessionaria.vehicle.dto.VehicleFilter;
import com.concessionaria.vehicle.dto.VehicleSummaryResponse;
import com.concessionaria.vehicle.spec.VehicleSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class VehicleService {

    private static final BigDecimal RELATED_PRICE_LOWER_FACTOR = BigDecimal.valueOf(0.8);
    private static final BigDecimal RELATED_PRICE_UPPER_FACTOR = BigDecimal.valueOf(1.2);

    private final VehicleRepository vehicleRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public VehicleService(VehicleRepository vehicleRepository, BrandRepository brandRepository,
                           CategoryRepository categoryRepository, FileStorageService fileStorageService) {
        this.vehicleRepository = vehicleRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    public PageResponse<VehicleSummaryResponse> searchPublic(VehicleFilter filter, Pageable pageable) {
        VehicleFilter publicFilter = withStatuses(filter, VehicleStatus.PUBLICLY_VISIBLE);
        Page<Vehicle> page = vehicleRepository.findAll(VehicleSpecifications.withFilter(publicFilter), pageable);
        return PageResponse.from(page, VehicleSummaryResponse::from);
    }

    public PageResponse<VehicleSummaryResponse> searchAdmin(VehicleFilter filter, Pageable pageable) {
        Page<Vehicle> page = vehicleRepository.findAll(VehicleSpecifications.withFilter(filter), pageable);
        return PageResponse.from(page, VehicleSummaryResponse::from);
    }

    public VehicleDetailResponse getPublicDetailBySlug(String slug) {
        Vehicle vehicle = vehicleRepository.findBySlug(slug)
                .filter(v -> VehicleStatus.PUBLICLY_VISIBLE.contains(v.getStatus()))
                .orElseThrow(() -> ResourceNotFoundException.of("Veículo", slug));
        return VehicleDetailResponse.from(vehicle);
    }

    public VehicleDetailResponse getAdminDetailById(Long id) {
        return VehicleDetailResponse.from(getVehicleOrThrow(id));
    }

    public List<VehicleSummaryResponse> featured(int limit) {
        List<Vehicle> vehicles = vehicleRepository.findByStatusInAndFeaturedTrueOrderByCreatedAtDesc(
                List.copyOf(VehicleStatus.PUBLICLY_VISIBLE), PageRequest.of(0, limit));
        return vehicles.stream().map(VehicleSummaryResponse::from).toList();
    }

    public List<VehicleSummaryResponse> recent(int limit) {
        List<Vehicle> vehicles = vehicleRepository.findByStatusInOrderByCreatedAtDesc(
                List.copyOf(VehicleStatus.PUBLICLY_VISIBLE), PageRequest.of(0, limit));
        return vehicles.stream().map(VehicleSummaryResponse::from).toList();
    }

    public List<VehicleSummaryResponse> related(Long id, int limit) {
        Vehicle vehicle = getVehicleOrThrow(id);
        BigDecimal minPrice = vehicle.getPrice().multiply(RELATED_PRICE_LOWER_FACTOR);
        BigDecimal maxPrice = vehicle.getPrice().multiply(RELATED_PRICE_UPPER_FACTOR);
        List<Vehicle> related = vehicleRepository.findRelated(
                id, vehicle.getCategory().getId(), vehicle.getBrand().getId(),
                minPrice, maxPrice, List.copyOf(VehicleStatus.PUBLICLY_VISIBLE), PageRequest.of(0, limit));
        return related.stream().map(VehicleSummaryResponse::from).toList();
    }

    @Transactional
    public VehicleDetailResponse create(VehicleCreateRequest request) {
        Brand brand = getBrandOrThrow(request.brandId());
        Category category = getCategoryOrThrow(request.categoryId());

        Vehicle vehicle = new Vehicle();
        vehicle.setBrand(brand);
        vehicle.setCategory(category);
        applyRequest(vehicle, request);
        vehicle.setSlug(generateUniqueSlug(brand, request.model(), request.version(), request.year(), null));

        if (request.specifications() != null) {
            vehicle.setTechnicalSpecification(buildSpecification(vehicle, request.specifications()));
        }

        return VehicleDetailResponse.from(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleDetailResponse update(Long id, VehicleCreateRequest request) {
        Vehicle vehicle = getVehicleOrThrow(id);
        Brand brand = getBrandOrThrow(request.brandId());
        Category category = getCategoryOrThrow(request.categoryId());

        boolean slugRelevantChanged = !vehicle.getBrand().getId().equals(brand.getId())
                || !vehicle.getModel().equalsIgnoreCase(request.model())
                || !vehicle.getVersion().equalsIgnoreCase(request.version())
                || !vehicle.getYear().equals(request.year());

        vehicle.setBrand(brand);
        vehicle.setCategory(category);
        applyRequest(vehicle, request);

        if (slugRelevantChanged) {
            vehicle.setSlug(generateUniqueSlug(brand, request.model(), request.version(), request.year(), id));
        }

        if (request.specifications() != null) {
            applySpecification(vehicle, request.specifications());
        }

        return VehicleDetailResponse.from(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleDetailResponse updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = getVehicleOrThrow(id);
        vehicle.setStatus(status);
        return VehicleDetailResponse.from(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleDetailResponse updateFeatured(Long id, boolean featured) {
        Vehicle vehicle = getVehicleOrThrow(id);
        vehicle.setFeatured(featured);
        return VehicleDetailResponse.from(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleDetailResponse upsertSpecifications(Long id, TechnicalSpecificationRequest request) {
        Vehicle vehicle = getVehicleOrThrow(id);
        applySpecification(vehicle, request);
        return VehicleDetailResponse.from(vehicleRepository.save(vehicle));
    }

    @Transactional
    public void delete(Long id) {
        Vehicle vehicle = getVehicleOrThrow(id);
        vehicle.getImages().forEach(image -> fileStorageService.delete(image.getStoragePath()));
        vehicleRepository.delete(vehicle);
    }

    private VehicleFilter withStatuses(VehicleFilter filter, java.util.Set<VehicleStatus> statuses) {
        return new VehicleFilter(filter.brandId(), filter.categoryId(), filter.vehicleType(), filter.minYear(),
                filter.maxYear(), filter.minPrice(), filter.maxPrice(), filter.maxMileage(), filter.fuel(),
                filter.transmission(), filter.q(), statuses);
    }

    private void applyRequest(Vehicle vehicle, VehicleCreateRequest request) {
        vehicle.setModel(request.model());
        vehicle.setVersion(request.version());
        vehicle.setVehicleType(request.vehicleType());
        vehicle.setYear(request.year());
        vehicle.setMileage(request.mileage());
        vehicle.setPrice(request.price());
        vehicle.setPromotionalPrice(request.promotionalPrice());
        vehicle.setFuel(request.fuel());
        vehicle.setTransmission(request.transmission());
        vehicle.setColor(request.color());
        vehicle.setLicensePlateLastDigits(request.licensePlateLastDigits());
        vehicle.setDescription(request.description());
        vehicle.setStatus(request.status() != null ? request.status() : VehicleStatus.DISPONIVEL);
        vehicle.setFeatured(request.featured() != null && request.featured());
    }

    private TechnicalSpecification buildSpecification(Vehicle vehicle, TechnicalSpecificationRequest request) {
        TechnicalSpecification spec = new TechnicalSpecification();
        spec.setVehicle(vehicle);
        copySpecFields(spec, request);
        return spec;
    }

    private void applySpecification(Vehicle vehicle, TechnicalSpecificationRequest request) {
        TechnicalSpecification spec = vehicle.getTechnicalSpecification();
        if (spec == null) {
            vehicle.setTechnicalSpecification(buildSpecification(vehicle, request));
        } else {
            copySpecFields(spec, request);
        }
    }

    private void copySpecFields(TechnicalSpecification spec, TechnicalSpecificationRequest request) {
        spec.setEngine(request.engine());
        spec.setDisplacement(request.displacement());
        spec.setHorsepower(request.horsepower());
        spec.setTorque(request.torque());
        spec.setTraction(request.traction());
        spec.setUrbanConsumption(request.urbanConsumption());
        spec.setHighwayConsumption(request.highwayConsumption());
        spec.setFuelTankCapacity(request.fuelTankCapacity());
        spec.setDoors(request.doors());
        spec.setSeats(request.seats());
        spec.setWeight(request.weight());
        spec.setLength(request.length());
        spec.setWidth(request.width());
        spec.setHeight(request.height());
    }

    private String generateUniqueSlug(Brand brand, String model, String version, Integer year, Long excludeId) {
        String base = SlugUtils.slugify(brand.getName() + "-" + model + "-" + version + "-" + year);
        String candidate = base;
        int suffix = 2;
        while (slugTaken(candidate, excludeId)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private boolean slugTaken(String candidate, Long excludeId) {
        return excludeId == null
                ? vehicleRepository.existsBySlug(candidate)
                : vehicleRepository.existsBySlugAndIdNot(candidate, excludeId);
    }

    Vehicle getVehicleOrThrow(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Veículo", id));
    }

    private Brand getBrandOrThrow(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Marca", id));
    }

    private Category getCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Categoria", id));
    }
}
