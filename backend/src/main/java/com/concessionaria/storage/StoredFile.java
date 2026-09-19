package com.concessionaria.storage;

/**
 * @param relativePath path used internally to later delete/resolve the file
 * @param publicUrl    URL that can be served directly to clients
 */
public record StoredFile(String relativePath, String publicUrl) {
}
