package com.concessionaria.exception;

/**
 * Raised when a request is well-formed but violates a domain rule
 * (e.g. deleting a brand that still has vehicles linked to it).
 */
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
