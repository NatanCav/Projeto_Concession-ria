package com.concessionaria.vehicle;

import com.concessionaria.common.PageResponse;
import com.concessionaria.vehicle.dto.VehicleCreateRequest;
import com.concessionaria.vehicle.dto.VehicleDetailResponse;
import com.concessionaria.vehicle.dto.VehicleFeaturedRequest;
import com.concessionaria.vehicle.dto.VehicleFilter;
import com.concessionaria.vehicle.dto.VehicleStatusRequest;
import com.concessionaria.vehicle.dto.VehicleSortOption;
import com.concessionaria.vehicle.dto.VehicleSummaryResponse;
import com.concessionaria.vehicle.dto.TechnicalSpecificationRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/vehicles")
@Tag(name = "Veículos")
public class VehicleController {

    private static final int DEFAULT_RELATED_LIMIT = 4;
    private static final int DEFAULT_FEATURED_LIMIT = 8;
    private static final int DEFAULT_RECENT_LIMIT = 8;

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public PageResponse<VehicleSummaryResponse> searchPublic(
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(required = false) Integer minYear,
            @RequestParam(required = false) Integer maxYear,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer maxMileage,
            @RequestParam(required = false) FuelType fuel,
            @RequestParam(required = false) TransmissionType transmission,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "recentes") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        VehicleFilter filter = new VehicleFilter(brandId, categoryId, vehicleType, minYear, maxYear, minPrice,
                maxPrice, maxMileage, fuel, transmission, q, null);
        return vehicleService.searchPublic(filter, pageable(page, size, sort));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public PageResponse<VehicleSummaryResponse> searchAdmin(
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(required = false) VehicleStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "recentes") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Set<VehicleStatus> statuses = status == null ? null : Set.of(status);
        VehicleFilter filter = new VehicleFilter(brandId, categoryId, vehicleType, null, null, null, null, null,
                null, null, q, statuses);
        return vehicleService.searchAdmin(filter, pageable(page, size, sort));
    }

    @GetMapping("/featured")
    public List<VehicleSummaryResponse> featured(@RequestParam(defaultValue = "" + DEFAULT_FEATURED_LIMIT) int limit) {
        return vehicleService.featured(limit);
    }

    @GetMapping("/recent")
    public List<VehicleSummaryResponse> recent(@RequestParam(defaultValue = "" + DEFAULT_RECENT_LIMIT) int limit) {
        return vehicleService.recent(limit);
    }

    @GetMapping("/slug/{slug}")
    public VehicleDetailResponse getBySlug(@PathVariable String slug) {
        return vehicleService.getPublicDetailBySlug(slug);
    }

    @GetMapping("/{id}/related")
    public List<VehicleSummaryResponse> related(@PathVariable Long id,
                                                 @RequestParam(defaultValue = "" + DEFAULT_RELATED_LIMIT) int limit) {
        return vehicleService.related(id, limit);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public VehicleDetailResponse getById(@PathVariable Long id) {
        return vehicleService.getAdminDetailById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<VehicleDetailResponse> create(@Valid @RequestBody VehicleCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public VehicleDetailResponse update(@PathVariable Long id, @Valid @RequestBody VehicleCreateRequest request) {
        return vehicleService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public VehicleDetailResponse updateStatus(@PathVariable Long id, @Valid @RequestBody VehicleStatusRequest request) {
        return vehicleService.updateStatus(id, request.status());
    }

    @PatchMapping("/{id}/featured")
    @PreAuthorize("hasRole('ADMIN')")
    public VehicleDetailResponse updateFeatured(@PathVariable Long id, @Valid @RequestBody VehicleFeaturedRequest request) {
        return vehicleService.updateFeatured(id, request.featured());
    }

    @PutMapping("/{id}/specifications")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public VehicleDetailResponse upsertSpecifications(@PathVariable Long id,
                                                       @Valid @RequestBody TechnicalSpecificationRequest request) {
        return vehicleService.upsertSpecifications(id, request);
    }

    private Pageable pageable(int page, int size, String sort) {
        return PageRequest.of(page, size, VehicleSortOption.fromParam(sort).toSort());
    }
}
