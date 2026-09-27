package com.concessionaria.analytics;

import com.concessionaria.analytics.dto.PageViewRequest;
import com.concessionaria.brand.BrandRepository;
import com.concessionaria.exception.BusinessRuleException;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.vehicle.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AnalyticsService {

    private final PageViewRepository pageViewRepository;
    private final BrandRepository brandRepository;
    private final VehicleRepository vehicleRepository;

    public AnalyticsService(PageViewRepository pageViewRepository, BrandRepository brandRepository,
                             VehicleRepository vehicleRepository) {
        this.pageViewRepository = pageViewRepository;
        this.brandRepository = brandRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public void recordView(PageViewRequest request) {
        PageView view = new PageView();
        if (request.vehicleId() != null) {
            Long brandId = vehicleRepository.findBrandIdById(request.vehicleId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Veículo", request.vehicleId()));
            view.setVehicle(vehicleRepository.getReferenceById(request.vehicleId()));
            view.setBrand(brandRepository.getReferenceById(brandId));
        } else if (request.brandId() != null) {
            if (!brandRepository.existsById(request.brandId())) {
                throw ResourceNotFoundException.of("Marca", request.brandId());
            }
            view.setBrand(brandRepository.getReferenceById(request.brandId()));
        } else {
            throw new BusinessRuleException("Informe a loja ou o veículo visitado.");
        }
        pageViewRepository.save(view);
    }
}
