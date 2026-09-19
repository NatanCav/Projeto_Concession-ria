package com.concessionaria.dashboard;

import com.concessionaria.dashboard.dto.DashboardSummaryResponse;
import com.concessionaria.lead.LeadService;
import com.concessionaria.vehicle.VehicleRepository;
import com.concessionaria.vehicle.VehicleStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final LeadService leadService;

    public DashboardService(VehicleRepository vehicleRepository, LeadService leadService) {
        this.vehicleRepository = vehicleRepository;
        this.leadService = leadService;
    }

    public DashboardSummaryResponse summary() {
        return new DashboardSummaryResponse(
                vehicleRepository.count(),
                vehicleRepository.countByStatus(VehicleStatus.DISPONIVEL),
                vehicleRepository.countByStatus(VehicleStatus.RESERVADO),
                vehicleRepository.countByStatus(VehicleStatus.VENDIDO),
                vehicleRepository.countByStatus(VehicleStatus.INATIVO),
                vehicleRepository.countByFeaturedTrue(),
                leadService.count()
        );
    }
}
