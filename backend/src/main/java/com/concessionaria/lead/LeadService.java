package com.concessionaria.lead;

import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.lead.dto.LeadRequest;
import com.concessionaria.vehicle.Vehicle;
import com.concessionaria.vehicle.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LeadService {

    private final ContactLeadRepository contactLeadRepository;
    private final VehicleRepository vehicleRepository;

    public LeadService(ContactLeadRepository contactLeadRepository, VehicleRepository vehicleRepository) {
        this.contactLeadRepository = contactLeadRepository;
        this.vehicleRepository = vehicleRepository;
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
}
