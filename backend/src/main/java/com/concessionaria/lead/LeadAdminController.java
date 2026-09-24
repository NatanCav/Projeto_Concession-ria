package com.concessionaria.lead;

import com.concessionaria.common.PageResponse;
import com.concessionaria.lead.dto.LeadResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/leads")
@PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
@Tag(name = "Interesses de contato (admin)")
public class LeadAdminController {

    private final LeadService leadService;

    public LeadAdminController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    public PageResponse<LeadResponse> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return leadService.findAllAdmin(PageRequest.of(page, size));
    }
}
