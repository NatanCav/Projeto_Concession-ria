package com.concessionaria.lead;

import com.concessionaria.common.PageResponse;
import com.concessionaria.lead.dto.LeadResponse;
import com.concessionaria.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Slice test focused on role-based authorization for {@link LeadAdminController},
 * mirroring the approach used by {@code VehicleControllerTest}: the production
 * {@code SecurityConfig} (JWT filter, CORS, permitAll rules) is intentionally not
 * imported so {@code @PreAuthorize} can be exercised directly against
 * {@code @WithMockUser} principals.
 */
@WebMvcTest(
        controllers = LeadAdminController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@Import(LeadAdminControllerTest.TestSecurityConfig.class)
class LeadAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LeadService leadService;

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

    private PageResponse<LeadResponse> samplePage() {
        LeadResponse lead = new LeadResponse(1L, 10L, "Toyota Corolla XEi 2023", Instant.now());
        return new PageResponse<>(List.of(lead), 0, 20, 1, 1, true);
    }

    @Test
    void findAll_returnsUnauthorized_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/leads"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void findAll_returnsOk_whenAuthenticatedAsAdmin() throws Exception {
        when(leadService.findAllAdmin(any())).thenReturn(samplePage());

        mockMvc.perform(get("/api/admin/leads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].vehicleLabel").value("Toyota Corolla XEi 2023"))
                .andExpect(jsonPath("$.content[0].vehicleId").value(10))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(authorities = "ROLE_VENDEDOR")
    void findAll_returnsOk_whenAuthenticatedAsVendedor() throws Exception {
        when(leadService.findAllAdmin(any())).thenReturn(samplePage());

        mockMvc.perform(get("/api/admin/leads"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void findAll_forwardsPageAndSizeParams() throws Exception {
        when(leadService.findAllAdmin(any())).thenReturn(samplePage());

        mockMvc.perform(get("/api/admin/leads").param("page", "2").param("size", "5"))
                .andExpect(status().isOk());

        verify(leadService).findAllAdmin(PageRequest.of(2, 5));
    }
}
