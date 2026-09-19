package com.concessionaria.vehicle;

import com.concessionaria.exception.BusinessRuleException;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.storage.FileStorageService;
import com.concessionaria.storage.StoredFile;
import com.concessionaria.vehicle.dto.VehicleImageResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class VehicleImageService {

    private final VehicleRepository vehicleRepository;
    private final FileStorageService fileStorageService;

    public VehicleImageService(VehicleRepository vehicleRepository, FileStorageService fileStorageService) {
        this.vehicleRepository = vehicleRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<VehicleImageResponse> addImages(Long vehicleId, List<MultipartFile> files) {
        Vehicle vehicle = getVehicleOrThrow(vehicleId);

        int nextOrder = vehicle.getImages().stream()
                .mapToInt(VehicleImage::getDisplayOrder)
                .max()
                .orElse(-1) + 1;
        boolean hasPrimary = vehicle.getImages().stream().anyMatch(VehicleImage::isPrimary);

        for (MultipartFile file : files) {
            StoredFile stored = fileStorageService.store(file, "vehicles/" + vehicleId);
            VehicleImage image = new VehicleImage();
            image.setVehicle(vehicle);
            image.setImageUrl(stored.publicUrl());
            image.setStoragePath(stored.relativePath());
            image.setDisplayOrder(nextOrder++);
            image.setPrimary(!hasPrimary);
            hasPrimary = true;
            vehicle.getImages().add(image);
        }

        vehicleRepository.save(vehicle);
        return sortedImageResponses(vehicle);
    }

    public List<VehicleImageResponse> setPrimary(Long vehicleId, Long imageId) {
        Vehicle vehicle = getVehicleOrThrow(vehicleId);
        boolean found = false;
        for (VehicleImage image : vehicle.getImages()) {
            boolean isTarget = image.getId().equals(imageId);
            image.setPrimary(isTarget);
            found = found || isTarget;
        }
        if (!found) {
            throw ResourceNotFoundException.of("Imagem", imageId);
        }
        vehicleRepository.save(vehicle);
        return sortedImageResponses(vehicle);
    }

    public List<VehicleImageResponse> reorder(Long vehicleId, List<Long> orderedImageIds) {
        Vehicle vehicle = getVehicleOrThrow(vehicleId);
        List<VehicleImage> images = vehicle.getImages();

        if (orderedImageIds.size() != images.size()
                || !images.stream().map(VehicleImage::getId).allMatch(orderedImageIds::contains)) {
            throw new BusinessRuleException("A lista de reordenação deve conter exatamente as imagens do veículo.");
        }

        for (VehicleImage image : images) {
            image.setDisplayOrder(orderedImageIds.indexOf(image.getId()));
        }

        vehicleRepository.save(vehicle);
        return sortedImageResponses(vehicle);
    }

    public List<VehicleImageResponse> delete(Long vehicleId, Long imageId) {
        Vehicle vehicle = getVehicleOrThrow(vehicleId);
        VehicleImage target = vehicle.getImages().stream()
                .filter(image -> image.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> ResourceNotFoundException.of("Imagem", imageId));

        boolean wasPrimary = target.isPrimary();
        vehicle.getImages().remove(target);
        fileStorageService.delete(target.getStoragePath());

        if (wasPrimary) {
            vehicle.getImages().stream()
                    .min(Comparator.comparing(VehicleImage::getDisplayOrder))
                    .ifPresent(image -> image.setPrimary(true));
        }

        vehicleRepository.save(vehicle);
        return sortedImageResponses(vehicle);
    }

    private List<VehicleImageResponse> sortedImageResponses(Vehicle vehicle) {
        return vehicle.getImages().stream()
                .sorted(Comparator.comparing(VehicleImage::getDisplayOrder))
                .map(VehicleImageResponse::from)
                .toList();
    }

    private Vehicle getVehicleOrThrow(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Veículo", id));
    }
}
