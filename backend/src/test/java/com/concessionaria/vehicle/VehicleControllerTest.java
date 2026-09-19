package com.concessionaria.vehicle;

import com.concessionaria.brand.dto.BrandResponse;
import com.concessionaria.category.dto.CategoryResponse;
import com.concessionaria.security.JwtAuthenticationFilter;
import com.concessionaria.vehicle.dto.VehicleCreateRequest;
import com.concessionaria.vehicle.dto.VehicleDetailResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Slice test focused purely on role-based authorization ({@code @PreAuthorize})
 * and request validation for {@link VehicleController}. It intentionally does
 * NOT import the production {@code SecurityConfig} (JWT filter, CORS, public
 * permitAll rules) — those are covered by manual/integration verification —
 * and instead wires a minimal stateless security chain so {@code @PreAuthorize}
 * is actually enforced against {@code @WithMockUser} principals.
 */
@WebMvcTest(
        controllers = VehicleController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@Import(VehicleControllerTest.TestSecurityConfig.class)
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VehicleService vehicleService;

    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfig {
        @Bean
        SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable())
                    .exceptionHandling(ex -> ex
                            .authenticationEntryPoint((request, response, authException) -> response.sendError(401))
                            .accessDeniedHandler((request, response, accessDeniedException) -> response.sendError(403)))
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
            return http.build();
        }
    }

    private VehicleCreateRequest validRequest() {
        return new VehicleCreateRequest(
                1L, 1L, VehicleType.CARRO, "Corolla", "XEi 2.0", 2023, 15000,
                BigDecimal.valueOf(129900), null, FuelType.FLEX, TransmissionType.AUTOMATICO,
                "Prata", null, null, null, null, null
        );
    }

    private VehicleDetailResponse sampleDetail() {
        return new VehicleDetailResponse(
                1L, "toyota-corolla-xei-20-2023",
                new BrandResponse(1L, "Toyota", null, true),
                new CategoryResponse(1L, "Sedan", true),
                VehicleType.CARRO, "Corolla", "XEi 2.0", 2023, 15000,
                BigDecimal.valueOf(129900), null, FuelType.FLEX, TransmissionType.AUTOMATICO,
                "Prata", null, null, VehicleStatus.DISPONIVEL, false,
                List.of(), null, Instant.now()
        );
    }

    @Test
    void create_returnsUnauthorized_whenNotAuthenticated() throws Exception {
        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "ROLE_VENDEDOR")
    void create_returnsCreated_whenAuthenticatedAsVendedor() throws Exception {
        when(vehicleService.create(any())).thenReturn(sampleDetail());

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void create_returnsBadRequest_whenModelIsBlank() throws Exception {
        VehicleCreateRequest invalid = new VehicleCreateRequest(
                1L, 1L, VehicleType.CARRO, "", "XEi 2.0", 2023, 15000,
                BigDecimal.valueOf(129900), null, FuelType.FLEX, TransmissionType.AUTOMATICO,
                "Prata", null, null, null, null, null
        );

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void create_returnsBadRequest_whenPriceIsNegative() throws Exception {
        VehicleCreateRequest invalid = new VehicleCreateRequest(
                1L, 1L, VehicleType.CARRO, "Corolla", "XEi 2.0", 2023, 15000,
                BigDecimal.valueOf(-1), null, FuelType.FLEX, TransmissionType.AUTOMATICO,
                "Prata", null, null, null, null, null
        );

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "ROLE_VENDEDOR")
    void delete_returnsForbidden_whenAuthenticatedAsVendedor() throws Exception {
        mockMvc.perform(delete("/api/vehicles/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void delete_returnsNoContent_whenAuthenticatedAsAdmin() throws Exception {
        mockMvc.perform(delete("/api/vehicles/1"))
                .andExpect(status().isNoContent());

        verify(vehicleService).delete(1L);
    }

    @Test
    void delete_returnsUnauthorized_whenNotAuthenticated() throws Exception {
        mockMvc.perform(delete("/api/vehicles/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "ROLE_VENDEDOR")
    void updateStatus_returnsOk_whenAuthenticatedAsVendedor() throws Exception {
        when(vehicleService.updateStatus(eq(1L), any())).thenReturn(sampleDetail());

        mockMvc.perform(patch("/api/vehicles/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RESERVADO\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ROLE_VENDEDOR")
    void updateFeatured_returnsForbidden_whenAuthenticatedAsVendedor() throws Exception {
        mockMvc.perform(patch("/api/vehicles/1/featured")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"featured\":true}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void updateFeatured_returnsOk_whenAuthenticatedAsAdmin() throws Exception {
        when(vehicleService.updateFeatured(eq(1L), eq(true))).thenReturn(sampleDetail());

        mockMvc.perform(patch("/api/vehicles/1/featured")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"featured\":true}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ROLE_VENDEDOR")
    void getById_returnsOk_whenAuthenticatedAsVendedor() throws Exception {
        when(vehicleService.getAdminDetailById(anyLong())).thenReturn(sampleDetail());

        mockMvc.perform(get("/api/vehicles/1"))
                .andExpect(status().isOk());
    }

    @Test
    void getById_returnsUnauthorized_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/vehicles/1"))
                .andExpect(status().isUnauthorized());
    }
}
