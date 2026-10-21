package com.ADP.peerConnect.exception;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, Object> body = error(HttpStatus.BAD_REQUEST, "Validation failed", request);
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ex.getBindingResult().getGlobalErrors().forEach(e -> fields.putIfAbsent("_global", e.getDefaultMessage()));
        body.put("validationErrors", fields);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<Map<String, Object>> handleBinding(BindException ex, WebRequest request) {
        Map<String, Object> body = error(HttpStatus.BAD_REQUEST, "Validation failed", request);
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> fields.putIfAbsent(e.getField(), e.getDefaultMessage()));
        body.put("validationErrors", fields);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex, WebRequest request) {
        return respond(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoRoute(NoResourceFoundException ex, WebRequest request) {
        return respond(HttpStatus.NOT_FOUND, "The requested resource was not found.", request);
    }

    @ExceptionHandler(ProjectDeletedException.class)
    public ResponseEntity<Map<String, Object>> handleDeleted(ProjectDeletedException ex, WebRequest request) {
        return respond(HttpStatus.GONE, ex.getMessage(), request);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex, WebRequest request) {
        return respond(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(PayloadTooLargeException.class)
    public ResponseEntity<Map<String, Object>> handlePayloadTooLarge(PayloadTooLargeException ex, WebRequest request) {
        return respond(HttpStatus.PAYLOAD_TOO_LARGE, ex.getMessage(), request);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMultipartTooLarge(MaxUploadSizeExceededException ex, WebRequest request) {
        return respond(HttpStatus.PAYLOAD_TOO_LARGE, "Uploaded file exceeds the maximum allowed size.", request);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(ConflictException ex, WebRequest request) {
        return respond(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(ForbiddenException ex, WebRequest request) {
        return respond(HttpStatus.FORBIDDEN, ex.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleSpringForbidden(AccessDeniedException ex, WebRequest request) {
        return respond(HttpStatus.FORBIDDEN, "Access denied.", request);
    }

    @ExceptionHandler({UnauthorizedException.class, AuthenticationException.class})
    public ResponseEntity<Map<String, Object>> handleUnauthenticated(Exception ex, WebRequest request) {
        String message = ex instanceof UnauthorizedException ? ex.getMessage() : "Authentication is required.";
        return respond(HttpStatus.UNAUTHORIZED, safeMessage(message, "Authentication is required."), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataConflict(DataIntegrityViolationException ex, WebRequest request) {
        logger.warn("Database constraint rejected request", ex);
        return respond(HttpStatus.CONFLICT,
                "The operation conflicts with existing data. Refresh the page and try again.", request);
    }

    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<Map<String, Object>> handleServiceUnavailable(ServiceUnavailableException ex, WebRequest request) {
        logger.error("External dependency unavailable", ex);
        return respond(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), request);
    }

    @ExceptionHandler(DataAccessResourceFailureException.class)
    public ResponseEntity<Map<String, Object>> handleDatabaseUnavailable(DataAccessResourceFailureException ex, WebRequest request) {
        logger.error("Database connection/resource failure", ex);
        return respond(HttpStatus.SERVICE_UNAVAILABLE, "The data service is temporarily unavailable. Please try again.", request);
    }

    @ExceptionHandler({ConstraintViolationException.class, MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class, MissingServletRequestParameterException.class,
            HandlerMethodValidationException.class})
    public ResponseEntity<Map<String, Object>> handleMalformedRequest(Exception ex, WebRequest request) {
        return respond(HttpStatus.BAD_REQUEST, "Invalid request parameters or body.", request);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException ex, WebRequest request) {
        return respond(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported request content type.", request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        return respond(HttpStatus.METHOD_NOT_ALLOWED, "The HTTP method is not supported for this endpoint.", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex, WebRequest request) {
        logger.error("Unhandled request failure", ex);
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred. Please try again later.", request);
    }

    private ResponseEntity<Map<String, Object>> respond(HttpStatus status, String message, WebRequest request) {
        return ResponseEntity.status(status).body(error(status, message, request));
    }

    private Map<String, Object> error(HttpStatus status, String message, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", request.getDescription(false).replace("uri=", ""));
        return body;
    }

    private String safeMessage(String message, String fallback) {
        return message == null || message.isBlank() ? fallback : message;
    }
}
