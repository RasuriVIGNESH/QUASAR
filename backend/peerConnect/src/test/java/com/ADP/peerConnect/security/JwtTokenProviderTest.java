package com.ADP.peerConnect.security;

import com.ADP.peerConnect.config.JwtConfig;
import com.ADP.peerConnect.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {
    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        JwtConfig config = new JwtConfig();
        config.setSecret("a-test-secret-that-is-at-least-32-bytes-long");
        config.setExpiration(60_000);
        provider = new JwtTokenProvider(config);
    }

    @Test
    void generatesValidTokenAndExtractsClaims() {
        String token = provider.generateTokenFromUserId("user-1", "user@example.com", "Ada", "Lovelace");

        assertTrue(provider.validateToken(token));
        assertEquals("user-1", provider.getUserIdFromToken(token));
        assertEquals("user@example.com", provider.getEmailFromToken(token));
        assertEquals("Ada", provider.getFirstNameFromToken(token));
        assertEquals("Lovelace", provider.getLastNameFromToken(token));
    }

    @Test
    void extractsBearerHeaderOnlyWhenCorrectlyPrefixed() {
        String token = "abc.def.ghi";
        assertEquals(token, provider.getTokenFromRequest("Bearer " + token));
        assertNull(provider.getTokenFromRequest(null));
        assertNull(provider.getTokenFromRequest("Basic " + token));
        assertNull(provider.getTokenFromRequest("Bearer"));
    }

    @Test
    void rejectsMalformedAndMissingTokensWithApplicationException() {
        assertThrows(UnauthorizedException.class, () -> provider.validateToken("not-a-jwt"));
        assertThrows(UnauthorizedException.class, () -> provider.validateToken(null));
    }
}
