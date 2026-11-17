package com.ADP.peerConnect.security;

import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.service.UserService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {
    @AfterEach
    void clearContext() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    @Test
    void validBearerTokenLoadsUserAndPopulatesSecurityContext() throws Exception {
        JwtTokenProvider tokenProvider = mock(JwtTokenProvider.class);
        UserService userService = mock(UserService.class);
        UserPrincipal principal = new UserPrincipal("user-1", "user@example.com", "encoded", "Ada", "Lovelace",
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
        when(tokenProvider.validateToken("good-token")).thenReturn(true);
        when(tokenProvider.getUserIdFromToken("good-token")).thenReturn("user-1");
        when(userService.loadUserById("user-1")).thenReturn(principal);

        JwtAuthenticationFilter filter = new JwtAuthenticationFilter();
        ReflectionTestUtils.setField(filter, "tokenProvider", tokenProvider);
        ReflectionTestUtils.setField(filter, "userService", userService);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/projects/project-1");
        request.addHeader("Authorization", "Bearer good-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertNotNull(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
        assertEquals("user@example.com", org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName());
        verify(chain).doFilter(request, response);
    }

    @Test
    void unauthorizedTokenReturnsJson401AndDoesNotContinueChain() throws Exception {
        JwtTokenProvider tokenProvider = mock(JwtTokenProvider.class);
        UserService userService = mock(UserService.class);
        when(tokenProvider.validateToken("bad-token")).thenThrow(new UnauthorizedException("Invalid token. Please login again."));

        JwtAuthenticationFilter filter = new JwtAuthenticationFilter();
        ReflectionTestUtils.setField(filter, "tokenProvider", tokenProvider);
        ReflectionTestUtils.setField(filter, "userService", userService);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/projects/project-1");
        request.addHeader("Authorization", "Bearer bad-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertEquals(401, response.getStatus());
        assertTrue(response.getContentAsString().contains("Invalid token. Please login again."));
        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void authRegisterSkipsJwtProcessing() throws Exception {
        JwtTokenProvider tokenProvider = mock(JwtTokenProvider.class);
        UserService userService = mock(UserService.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter();
        ReflectionTestUtils.setField(filter, "tokenProvider", tokenProvider);
        ReflectionTestUtils.setField(filter, "userService", userService);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/register");

        assertTrue(filter.shouldNotFilter(request));
        verifyNoInteractions(tokenProvider, userService);
    }
}
