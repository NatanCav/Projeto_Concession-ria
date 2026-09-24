package com.concessionaria.lead;

import com.concessionaria.common.PageResponse;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.lead.dto.LeadRequest;
import com.concessionaria.lead.dto.LeadResponse;
import com.concessionaria.vehicle.Vehicle;
import com.concessionaria.vehicle.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeadServiceTest {

    @Mock
    private ContactLeadRepository contactLeadRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    private LeadService leadService;

    @BeforeEach
    void setUp() {
        leadService = new LeadService(contactLeadRepository, vehicleRepository);
    }

    @Test
    void register_persistsLeadWithDenormalizedVehicleLabel_whenVehicleExists() {
        Vehicle vehicle = vehicleWithId(10L, "Corolla", "XEi 2.0", 2023);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        leadService.register(new LeadRequest(10L));

        ArgumentCaptor<ContactLead> captor = ArgumentCaptor.forClass(ContactLead.class);
        verify(contactLeadRepository).save(captor.capture());
        assertThat(captor.getValue().getVehicle()).isEqualTo(vehicle);
        assertThat(captor.getValue().getVehicleLabel()).isEqualTo("Toyota Corolla XEi 2.0 2023");
    }

    @Test
    void register_throwsResourceNotFound_whenVehicleDoesNotExist() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> leadService.register(new LeadRequest(99L)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void count_returnsRepositoryCount() {
        when(contactLeadRepository.count()).thenReturn(7L);

        assertThat(leadService.count()).isEqualTo(7L);
    }

    @Test
    void findAllAdmin_mapsPageOfLeadsToLeadResponse_preservingRepositoryOrder() {
        Vehicle vehicle = vehicleWithId(10L, "Corolla", "XEi 2.0", 2023);
        ContactLead lead = new ContactLead();
        lead.setId(1L);
        lead.setVehicle(vehicle);
        lead.setVehicleLabel("Toyota Corolla XEi 2.0 2023");

        Page<ContactLead> page = new PageImpl<>(List.of(lead), PageRequest.of(0, 20), 1);
        when(contactLeadRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(page);

        PageResponse<LeadResponse> result = leadService.findAllAdmin(PageRequest.of(0, 20));

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).id()).isEqualTo(1L);
        assertThat(result.content().get(0).vehicleId()).isEqualTo(10L);
        assertThat(result.content().get(0).vehicleLabel()).isEqualTo("Toyota Corolla XEi 2.0 2023");
        assertThat(result.totalElements()).isEqualTo(1);
    }

    @Test
    void findAllAdmin_toleratesLeadsWhoseVehicleWasDeleted() {
        ContactLead lead = new ContactLead();
        lead.setId(2L);
        lead.setVehicle(null);
        lead.setVehicleLabel("Honda Civic EXL 2020");

        Page<ContactLead> page = new PageImpl<>(List.of(lead));
        when(contactLeadRepository.findAllByOrderByCreatedAtDesc(any())).thenReturn(page);

        PageResponse<LeadResponse> result = leadService.findAllAdmin(PageRequest.of(0, 20));

        assertThat(result.content().get(0).vehicleId()).isNull();
        assertThat(result.content().get(0).vehicleLabel()).isEqualTo("Honda Civic EXL 2020");
    }

    private Vehicle vehicleWithId(Long id, String model, String version, Integer year) {
        Vehicle vehicle = new Vehicle();
        vehicle.setId(id);
        vehicle.setModel(model);
        vehicle.setVersion(version);
        vehicle.setYear(year);
        com.concessionaria.brand.Brand brand = new com.concessionaria.brand.Brand();
        brand.setName("Toyota");
        vehicle.setBrand(brand);
        return vehicle;
    }
}
