package com.concessionaria.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Development-grade implementation that stores files on the local disk.
 * Swappable for S3/Cloudinary by providing another {@link FileStorageService} bean.
 */
@Service
public class LocalFileStorageService implements FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final Path rootLocation;
    private final String publicUrlPrefix;

    public LocalFileStorageService(
            @Value("${app.storage.location}") String location,
            @Value("${app.storage.public-url-prefix}") String publicUrlPrefix
    ) {
        this.rootLocation = Paths.get(location).toAbsolutePath().normalize();
        this.publicUrlPrefix = publicUrlPrefix.endsWith("/") ? publicUrlPrefix : publicUrlPrefix + "/";
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new FileStorageException("Não foi possível criar o diretório de armazenamento de arquivos.", e);
        }
    }

    @Override
    public StoredFile store(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Arquivo vazio ou inválido.");
        }
        String extension = extractExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new FileStorageException("Tipo de arquivo não suportado. Use JPG, PNG ou WEBP.");
        }

        String safeSubDirectory = sanitize(subDirectory);
        String fileName = UUID.randomUUID() + "." + extension;
        String relativePath = safeSubDirectory + "/" + fileName;

        Path targetDirectory = rootLocation.resolve(safeSubDirectory).normalize();
        if (!targetDirectory.startsWith(rootLocation)) {
            throw new FileStorageException("Caminho de armazenamento inválido.");
        }

        try {
            Files.createDirectories(targetDirectory);
            Path targetFile = targetDirectory.resolve(fileName).normalize();
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new FileStorageException("Falha ao salvar o arquivo.", e);
        }

        return new StoredFile(relativePath, publicUrlPrefix + relativePath);
    }

    @Override
    public void delete(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            return;
        }
        try {
            Path target = rootLocation.resolve(relativePath).normalize();
            if (!target.startsWith(rootLocation)) {
                throw new FileStorageException("Caminho de arquivo inválido.");
            }
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new FileStorageException("Falha ao remover o arquivo.", e);
        }
    }

    private String extractExtension(String originalFilename) {
        if (!StringUtils.hasText(originalFilename) || !originalFilename.contains(".")) {
            return "";
        }
        String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1);
        return extension.toLowerCase(Locale.ROOT);
    }

    private String sanitize(String subDirectory) {
        if (!StringUtils.hasText(subDirectory)) {
            return "misc";
        }
        return subDirectory.replaceAll("[^a-zA-Z0-9/_-]", "");
    }

    List<String> allowedExtensions() {
        return List.copyOf(ALLOWED_EXTENSIONS);
    }
}
