package com.ADP.peerConnect.security.oauth2;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;


import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Redirect OAuth2 failures to the frontend so users see a friendly error page.
 * Uses a local method to clear authentication attributes to avoid depending
 * on parent's protected helper (works across Spring Security versions).
 */
@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationFailureHandler.class);

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String frontendOrigins;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {

        // Build frontend error redirect (first origin)
        String redirectBase = frontendOrigins.split(",")[0].trim();
        if (redirectBase.isEmpty()) {
            redirectBase = "http://localhost:5173";
        }

        String errorMessage = exception.getMessage() != null ? exception.getMessage() : "OAuth authentication failed";
        // Create a short error string (optionally you can URL-encode)
        String targetUrl = UriComponentsBuilder.fromUriString(redirectBase)
                .path("/login")
                .queryParam("error", errorMessage)
                .build().toUriString();

        logger.warn("OAuth2 authentication failed. Redirecting user to frontend login with error. targetUrl={}", targetUrl);

        // Clear attributes from session (local helper so no IDE/visibility issues)
        clearAuthenticationAttributesIfAny(request);

        // Redirect to frontend login with error message
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /**
     * Clear authentication attributes from session if present.
     * This mirrors what Spring's SimpleUrlAuthenticationFailureHandler.clearAuthenticationAttributes
     * does but avoids calling a protected method that might not exist in some versions.
     */
    private void clearAuthenticationAttributesIfAny(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return;
        }
        // Remove the attribute Spring sets for the authentication exception (if present)
        if (session != null) {
            session.removeAttribute(org.springframework.security.web.WebAttributes.AUTHENTICATION_EXCEPTION);
            session.removeAttribute("SPRING_SECURITY_LAST_EXCEPTION");
            session.removeAttribute("SPRING_SECURITY_LAST_USERNAME");
        }


        // Also remove the standard WebAttributes.AUTHENTICATION_EXCEPTION attribute
        session.removeAttribute(org.springframework.security.web.WebAttributes.AUTHENTICATION_EXCEPTION);
    }
}
