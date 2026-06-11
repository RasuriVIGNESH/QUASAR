package com.ADP.peerConnect.model.dto.response;

/**
 * Authentication response DTO
 */
public class AuthResponse {
    
    private String accessToken;
    private String tokenType = "Bearer";
    private UserResponse user;
    
    public AuthResponse() {}
    
    public AuthResponse(String accessToken, UserResponse user) {
        this.accessToken = accessToken;
        this.user = user;
    }
    
    // Getters and Setters
    public String getAccessToken() {
        return accessToken;
    }
    
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    
    public String getTokenType() {
        return tokenType;
    }
    
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
    
    public UserResponse getUser() {
        return user;
    }
    
    public void setUser(UserResponse user) {
        this.user = user;
    }
}

