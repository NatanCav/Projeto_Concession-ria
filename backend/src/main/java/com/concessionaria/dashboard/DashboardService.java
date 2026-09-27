package com.concessionaria.dashboard;

import com.concessionaria.analytics.PageViewRepository;
import com.concessionaria.brand.Brand;
import com.concessionaria.brand.BrandRepository;
import com.concessionaria.dashboard.dto.DashboardSummaryResponse;
import com.concessionaria.dashboard.dto.DashboardSummaryResponse.DailyCount;
import com.concessionaria.dashboard.dto.DashboardSummaryResponse.Financials;
import com.concessionaria.dashboard.dto.DashboardSummaryResponse.TopVehicle;
import com.concessionaria.dashboard.dto.StoreSummaryResponse;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.lead.ContactLeadRepository;
import com.concessionaria.security.CurrentUserService;
import com.concessionaria.user.UserRepository;
import com.concessionaria.vehicle.Vehicle;
import com.concessionaria.vehicle.VehicleRepository;
import com.concessionaria.vehicle.VehicleStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final int WINDOW_DAYS = 30;
    private static final int TOP_VEHICLES_LIMIT = 5;

    private final VehicleRepository vehicleRepository;
    private final BrandRepository brandRepository;
    private final ContactLeadRepository contactLeadRepository;
    private final PageViewRepository pageViewRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public DashboardService(VehicleRepository vehicleRepository, BrandRepository brandRepository,
                             ContactLeadRepository contactLeadRepository, PageViewRepository pageViewRepository,
                             UserRepository userRepository, CurrentUserService currentUserService) {
        this.vehicleRepository = vehicleRepository;
        this.brandRepository = brandRepository;
        this.contactLeadRepository = contactLeadRepository;
        this.pageViewRepository = pageViewRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    /**
     * Sellers always get their own store; administrators get every store combined, or the one
     * passed in {@code requestedBrandId}.
     */
    public DashboardSummaryResponse summary(Long requestedBrandId) {
        Long storeId = currentUserService.restrictedBrandId();
        Long brandId = storeId != null ? storeId : requestedBrandId;
        Brand brand = brandId == null ? null : brandRepository.findById(brandId)
                .orElseThrow(() -> ResourceNotFoundException.of("Marca", brandId));

        List<Vehicle> vehicles = brandId == null ? vehicleRepository.findAll() : vehicleRepository.findByBrandId(brandId);
        Instant since = windowStart();

        long visits = brandId == null
                ? pageViewRepository.countByCreatedAtGreaterThanEqual(since)
                : pageViewRepository.countByBrandIdAndCreatedAtGreaterThanEqual(brandId, since);
        List<Object[]> daily = brandId == null
                ? pageViewRepository.countDaily(since)
                : pageViewRepository.countDailyForBrand(brandId, since);
        List<Object[]> top = brandId == null
                ? pageViewRepository.topVehicles(since, PageRequest.of(0, TOP_VEHICLES_LIMIT))
                : pageViewRepository.topVehiclesForBrand(brandId, since, PageRequest.of(0, TOP_VEHICLES_LIMIT));
        long leads = brandId == null ? contactLeadRepository.count() : contactLeadRepository.countByVehicleBrandId(brandId);

        return new DashboardSummaryResponse(
                brandId,
                brand != null ? brand.getName() : null,
                vehicles.size(),
                countByStatus(vehicles, VehicleStatus.DISPONIVEL),
                countByStatus(vehicles, VehicleStatus.RESERVADO),
                countByStatus(vehicles, VehicleStatus.VENDIDO),
                countByStatus(vehicles, VehicleStatus.INATIVO),
                vehicles.stream().filter(Vehicle::isFeatured).count(),
                leads,
                visits,
                dailySeries(daily),
                topVehicles(top),
                financials(vehicles, since)
        );
    }

    public List<StoreSummaryResponse> stores() {
        Instant since = windowStart();
        Map<Long, List<Vehicle>> vehiclesByBrand = vehicleRepository.findAll().stream()
                .collect(Collectors.groupingBy(vehicle -> vehicle.getBrand().getId()));
        Map<Long, Long> visits = toCountMap(pageViewRepository.countByBrandSince(since));
        Map<Long, Long> leads = toCountMap(contactLeadRepository.countByBrand());
        Map<Long, Long> sellers = toCountMap(userRepository.countSellersByBrand());

        return brandRepository.findAll(Sort.by("name")).stream()
                .map(brand -> {
                    List<Vehicle> vehicles = vehiclesByBrand.getOrDefault(brand.getId(), List.of());
                    Financials financials = financials(vehicles, since);
                    return new StoreSummaryResponse(
                            brand.getId(),
                            brand.getName(),
                            brand.getLogoUrl(),
                            brand.isActive(),
                            vehicles.size(),
                            countByStatus(vehicles, VehicleStatus.DISPONIVEL),
                            countByStatus(vehicles, VehicleStatus.VENDIDO),
                            sellers.getOrDefault(brand.getId(), 0L),
                            visits.getOrDefault(brand.getId(), 0L),
                            leads.getOrDefault(brand.getId(), 0L),
                            financials.revenue(),
                            financials.profit()
                    );
                })
                .toList();
    }

    private Financials financials(List<Vehicle> vehicles, Instant since) {
        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal profit = BigDecimal.ZERO;
        BigDecimal stockValue = BigDecimal.ZERO;
        BigDecimal revenueLast30Days = BigDecimal.ZERO;
        long soldCount = 0;
        long soldWithoutCost = 0;
        long soldLast30Days = 0;

        for (Vehicle vehicle : vehicles) {
            if (vehicle.getStatus() == VehicleStatus.VENDIDO) {
                BigDecimal salePrice = vehicle.getSoldPrice() != null ? vehicle.getSoldPrice() : vehicle.getEffectivePrice();
                soldCount++;
                revenue = revenue.add(salePrice);
                if (vehicle.getCostPrice() != null) {
                    profit = profit.add(salePrice.subtract(vehicle.getCostPrice()));
                } else {
                    soldWithoutCost++;
                }
                if (vehicle.getSoldAt() != null && !vehicle.getSoldAt().isBefore(since)) {
                    soldLast30Days++;
                    revenueLast30Days = revenueLast30Days.add(salePrice);
                }
            } else if (VehicleStatus.PUBLICLY_VISIBLE.contains(vehicle.getStatus())) {
                stockValue = stockValue.add(vehicle.getEffectivePrice());
            }
        }

        return new Financials(revenue, profit, stockValue, soldCount, soldWithoutCost, revenueLast30Days, soldLast30Days);
    }

    private List<DailyCount> dailySeries(List<Object[]> rows) {
        Map<LocalDate, Long> byDay = new HashMap<>();
        for (Object[] row : rows) {
            byDay.put(((Date) row[0]).toLocalDate(), ((Number) row[1]).longValue());
        }
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        List<DailyCount> series = new ArrayList<>(WINDOW_DAYS);
        for (int offset = WINDOW_DAYS - 1; offset >= 0; offset--) {
            LocalDate day = today.minusDays(offset);
            series.add(new DailyCount(day, byDay.getOrDefault(day, 0L)));
        }
        return series;
    }

    private List<TopVehicle> topVehicles(List<Object[]> rows) {
        List<Long> ids = rows.stream().map(row -> (Long) row[0]).toList();
        Map<Long, Vehicle> vehicles = vehicleRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Vehicle::getId, Function.identity()));
        return rows.stream()
                .filter(row -> vehicles.containsKey((Long) row[0]))
                .map(row -> {
                    Vehicle vehicle = vehicles.get((Long) row[0]);
                    String label = vehicle.getBrand().getName() + " " + vehicle.getModel() + " " + vehicle.getVersion();
                    return new TopVehicle(vehicle.getId(), label, vehicle.getSlug(), ((Number) row[1]).longValue());
                })
                .toList();
    }

    private long countByStatus(List<Vehicle> vehicles, VehicleStatus status) {
        return vehicles.stream().filter(vehicle -> vehicle.getStatus() == status).count();
    }

    private Map<Long, Long> toCountMap(List<Object[]> rows) {
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : rows) {
            counts.put((Long) row[0], ((Number) row[1]).longValue());
        }
        return counts;
    }

    private Instant windowStart() {
        ZoneId zone = ZoneId.systemDefault();
        return LocalDate.now(zone).minusDays(WINDOW_DAYS - 1L).atStartOfDay(zone).toInstant();
    }
}
