package com.ADP.peerConnect.security;

import com.ADP.peerConnect.config.JwtConfig;
import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.util.Constants;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT token provider for generating and validating JWT tokens
 */
@Component
public class JwtTokenProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);
    
    private final JwtConfig jwtConfig;
    private final SecretKey secretKey;
    
    @Autowired
    public JwtTokenProvider(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
        this.secretKey = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes());
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        Date expiryDate = new Date(System.currentTimeMillis() + jwtConfig.getExpiration());
        
        return Jwts.builder()
                .setSubject(userPrincipal.getId())
                .claim("email", userPrincipal.getEmail())
                .claim("firstName", userPrincipal.getFirstName())
                .claim("lastName", userPrincipal.getLastName())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }
    

    public String generateTokenFromUserId(String userId, String email, String firstName, String lastName) {
        Date expiryDate = new Date(System.currentTimeMillis() + jwtConfig.getExpiration());
        
        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .claim("firstName", firstName)
                .claim("lastName", lastName)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        return claims.getSubject();
    }


    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException ex) {
            throw new UnauthorizedException("Session expired. Please login again.", ex);
        } catch (SecurityException | MalformedJwtException ex) {
            throw new UnauthorizedException("Invalid token. Please login again.", ex);
        } catch (UnsupportedJwtException ex) {
            throw new UnauthorizedException("Unsupported token. Please login again.", ex);
        } catch (IllegalArgumentException ex) {
            throw new UnauthorizedException("Token is missing or invalid. Please login again.", ex);
        }
    }


    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        return claims.get("email", String.class);
    }
    public String getFirstNameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        return claims.get("firstName", String.class);
    }
    public String getLastNameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        return claims.get("lastName", String.class);
    }
    public String getTokenFromRequest(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith(Constants.JWT_TOKEN_PREFIX)) {
            return authorizationHeader.substring(Constants.JWT_TOKEN_PREFIX.length());
        }
        return null;
    }
}

