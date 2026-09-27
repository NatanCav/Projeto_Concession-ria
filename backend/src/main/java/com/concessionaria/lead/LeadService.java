package com.concessionaria.lead;

import com.concessionaria.common.PageResponse;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.lead.dto.LeadRequest;
import com.concessionaria.lead.dto.LeadResponse;
import com.concessionaria.security.CurrentUserService;
import com.concessionaria.vehicle.Vehicle;
import com.concessionaria.vehicle.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LeadService {

    private final ContactLeadRepository contactLeadRepository;
    private final VehicleRepository vehicleRepository;
    private final CurrentUserService currentUserService;

    public LeadService(ContactLeadRepository contactLeadRepository, VehicleRepository vehicleRepository,
                        CurrentUserService currentUserService) {
        this.contactLeadRepository = contactLeadRepository;
        this.vehicleRepository = vehicleRepository;
        this.currentUserService = currentUserService;
    }

    public void register(LeadRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Veículo", request.vehicleId()));

        ContactLead lead = new ContactLead();
        lead.setVehicle(vehicle);
        lead.setVehicleLabel(vehicle.getBrand().getName() + " " + vehicle.getModel() + " " + vehicle.getVersion()
                + " " + vehicle.getYear());
        contactLeadRepository.save(lead);
    }

    @Transactional(readOnly = true)
    public long count() {
        return contactLeadRepository.count();
    }

    @Transactional(readOnly = true)
    public long countForBrand(Long brandId) {
        return brandId == null ? contactLeadRepository.count() : contactLeadRepository.countByVehicleBrandId(brandId);
    }

    @Transactional(readOnly = true)
    public PageResponse<LeadResponse> findAllAdmin(Pageable pageable) {
        Long storeId = currentUserService.restrictedBrandId();
        Page<ContactLead> page = storeId == null
                ? contactLeadRepository.findAllByOrderByCreatedAtDesc(pageable)
                : contactLeadRepository.findByVehicleBrandIdOrderByCreatedAtDesc(storeId, pageable);
        return PageResponse.from(page, LeadResponse::from);
    }
}
