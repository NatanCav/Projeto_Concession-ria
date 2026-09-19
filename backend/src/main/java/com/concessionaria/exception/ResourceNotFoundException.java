package com.concessionaria.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException of(String resource, Object identifier) {
        return new ResourceNotFoundException(resource + " não encontrado(a): " + identifier);
    }
}
