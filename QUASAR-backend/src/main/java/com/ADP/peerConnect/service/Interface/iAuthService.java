package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.dto.request.Auth.LoginRequest;
import com.ADP.peerConnect.model.dto.request.Auth.RegisterRequest;
import com.ADP.peerConnect.model.dto.response.AuthResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.security.UserPrincipal;

public interface iAuthService {
    public AuthResponse register(RegisterRequest registerRequest) ;
    public AuthResponse login(LoginRequest loginRequest) ;
    public UserResponse getCurrentUser(UserPrincipal currentUser) ;
}
