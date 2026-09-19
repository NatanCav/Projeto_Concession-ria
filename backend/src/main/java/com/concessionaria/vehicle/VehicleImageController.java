package com.concessionaria.vehicle;

import com.concessionaria.vehicle.dto.VehicleImageOrderRequest;
import com.concessionaria.vehicle.dto.VehicleImageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles/{vehicleId}/images")
@PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
@Tag(name = "Fotos do veículo")
public class VehicleImageController {

    private final VehicleImageService vehicleImageService;

    public VehicleImageController(VehicleImageService vehicleImageService) {
        this.vehicleImageService = vehicleImageService;
    }

    @PostMapping
    public ResponseEntity<List<VehicleImageResponse>> upload(@PathVariable Long vehicleId,
                                                              @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleImageService.addImages(vehicleId, files));
    }

    @PatchMapping("/order")
    public List<VehicleImageResponse> reorder(@PathVariable Long vehicleId,
                                               @Valid @RequestBody VehicleImageOrderRequest request) {
        return vehicleImageService.reorder(vehicleId, request.imageIds());
    }

    @PatchMapping("/{imageId}/primary")
    public List<VehicleImageResponse> setPrimary(@PathVariable Long vehicleId, @PathVariable Long imageId) {
        return vehicleImageService.setPrimary(vehicleId, imageId);
    }

    @DeleteMapping("/{imageId}")
    public List<VehicleImageResponse> delete(@PathVariable Long vehicleId, @PathVariable Long imageId) {
        return vehicleImageService.delete(vehicleId, imageId);
    }
}
