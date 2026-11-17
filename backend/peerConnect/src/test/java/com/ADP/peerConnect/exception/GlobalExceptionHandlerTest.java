package com.ADP.peerConnect.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.ServletWebRequest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();
    private final ServletWebRequest request;

    GlobalExceptionHandlerTest() {
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.setRequestURI("/api/projects/does-not-exist");
        request = new ServletWebRequest(servletRequest);
    }

    @Test
    void mapsNotFoundWithStableErrorContract() {
        ResponseEntity<Map<String, Object>> response = handler.handleNotFound(
                new ResourceNotFoundException("Project not found"), request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().get("status"));
        assertEquals("Project not found", response.getBody().get("message"));
        assertEquals("/api/projects/does-not-exist", response.getBody().get("path"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    void mapsUnauthorizedWithFallbackForBlankMessages() {
        ResponseEntity<Map<String, Object>> response = handler.handleUnauthenticated(
                new UnauthorizedException(""), request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Authentication is required.", response.getBody().get("message"));
    }

    @Test
    void mapsUnexpectedFailuresWithoutExposingInternalMessage() {
        ResponseEntity<Map<String, Object>> response = handler.handleUnexpected(
                new IllegalStateException("database password leaked"), request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("An unexpected error occurred. Please try again later.", response.getBody().get("message"));
        assertFalse(response.getBody().toString().contains("database password leaked"));
    }
}
