package com.ADP.peerConnect.exception;

/** Raised when a required external dependency is temporarily unavailable. */
public class ServiceUnavailableException extends RuntimeException {
    public ServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
