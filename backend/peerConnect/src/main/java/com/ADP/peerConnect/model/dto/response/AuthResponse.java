package com.ADP.peerConnect.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Authentication response DTO
 */

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class AuthResponse {
    
    private String accessToken;
    private String tokenType = "Bearer";
    private UserResponse user;

    public AuthResponse(String accessToken, UserResponse user) {
        this.accessToken = accessToken;
        this.user = user;
    }

}

