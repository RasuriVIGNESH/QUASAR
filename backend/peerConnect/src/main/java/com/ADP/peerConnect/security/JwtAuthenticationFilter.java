package com.ADP.peerConnect.security;

import com.ADP.peerConnect.service.UserService;
import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.util.Constants;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * JWT authentication filter for processing JWT tokens in requests
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = getJwtFromRequest(request);
        if (StringUtils.hasText(jwt)) {
            try {
                if (tokenProvider.validateToken(jwt)) {
                    String userId = tokenProvider.getUserIdFromToken(jwt);
                    UserDetails userDetails = userService.loadUserById(userId);
                    if (userDetails != null) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (UnauthorizedException ex) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                Map<String, Object> error = new LinkedHashMap<>();
                error.put("timestamp", LocalDateTime.now().toString());
                error.put("status", HttpServletResponse.SC_UNAUTHORIZED);
                error.put("error", "Unauthorized");
                error.put("message", ex.getMessage());
                error.put("path", request.getRequestURI());
                new ObjectMapper().writeValue(response.getOutputStream(), error);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    /**
     * Skip JWT filter for OAuth2 and public endpoints
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        // Skip filter for OAuth2 endpoints
        if (path.startsWith("/oauth2/") ||
                path.startsWith("/login/oauth2/") ||
                path.startsWith("/error")) {
            return true;
        }

        // Skip filter for public auth endpoints
        if (path.equals(Constants.AUTH_BASE_PATH + "/register") ||
                path.equals(Constants.AUTH_BASE_PATH + "/login") ||
                path.equals(Constants.AUTH_BASE_PATH + "/forgot-password") ||
                path.equals(Constants.AUTH_BASE_PATH + "/reset-password")) {
            return true;
        }

        // Skip filter for Swagger endpoints
        if (path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/api-docs")) {
            return true;
        }

        // Skip filter for static data endpoints
        if (path.startsWith(Constants.DATA_BASE_PATH)) {
            return true;
        }

        // Skip filter for WebSocket endpoints
        if (path.startsWith("/ws/")) {
            return true;
        }

        return false;
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(Constants.JWT_HEADER_STRING);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(Constants.JWT_TOKEN_PREFIX)) {
            return bearerToken.substring(Constants.JWT_TOKEN_PREFIX.length());
        }
        return null;
    }
}
