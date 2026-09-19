package com.concessionaria.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction over where uploaded files (vehicle photos, brand logos) live.
 * The development implementation ({@link LocalFileStorageService}) writes to
 * disk; a future {@code S3FileStorageService} or {@code CloudinaryFileStorageService}
 * can implement this same contract without touching callers.
 */
public interface FileStorageService {

    /**
     * Stores the file under a logical sub-directory (e.g. "vehicles/42") and
     * returns both the internal reference and the public URL to serve it.
     */
    StoredFile store(MultipartFile file, String subDirectory);

    /**
     * Removes a previously stored file. Safe to call even if the file is already gone.
     */
    void delete(String relativePath);
}
