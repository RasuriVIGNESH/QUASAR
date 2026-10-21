package com.ADP.peerConnect.exception;

/** Raised when an uploaded request payload exceeds the supported size. */
public class PayloadTooLargeException extends RuntimeException {
    public PayloadTooLargeException(String message) {
        super(message);
    }
}
