package com.ADP.peerConnect.model.dto.response;
import lombok.*;

@Data
public class AuthResponse {
    
    private String accessToken;
    private String tokenType = "Bearer";
    private UserResponse user;

    public AuthResponse(String accessToken, UserResponse user) {
        this.accessToken = accessToken;
        this.user = user;
    }

}

