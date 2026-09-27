package com.concessionaria.banner;

import com.concessionaria.banner.dto.BannerOrderRequest;
import com.concessionaria.banner.dto.BannerRequest;
import com.concessionaria.banner.dto.BannerResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Banners (admin)")
public class BannerAdminController {

    private final BannerService bannerService;

    public BannerAdminController(BannerService bannerService) {
        this.bannerService = bannerService;
    }

    @GetMapping
    public List<BannerResponse> findAll() {
        return bannerService.findAll();
    }

    @PostMapping
    public ResponseEntity<BannerResponse> create(@RequestPart("file") MultipartFile file,
                                                  @RequestParam(required = false) String title,
                                                  @RequestParam(required = false) String subtitle,
                                                  @RequestParam(required = false) String linkUrl,
                                                  @RequestParam(defaultValue = "true") boolean active) {
        BannerRequest request = new BannerRequest(title, subtitle, linkUrl, active);
        return ResponseEntity.status(HttpStatus.CREATED).body(bannerService.create(file, request));
    }

    @PutMapping("/{id}")
    public BannerResponse update(@PathVariable Long id, @Valid @RequestBody BannerRequest request) {
        return bannerService.update(id, request);
    }

    @PostMapping("/{id}/image")
    public BannerResponse replaceImage(@PathVariable Long id, @RequestPart("file") MultipartFile file) {
        return bannerService.replaceImage(id, file);
    }

    @PatchMapping("/order")
    public List<BannerResponse> reorder(@Valid @RequestBody BannerOrderRequest request) {
        return bannerService.reorder(request.ids());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
