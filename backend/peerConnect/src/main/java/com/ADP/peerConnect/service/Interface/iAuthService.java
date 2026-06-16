package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.dto.request.Auth.Login;
import com.ADP.peerConnect.model.dto.request.Auth.Register;
import com.ADP.peerConnect.model.dto.response.AuthResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.security.UserPrincipal;

public interface iAuthService {
    public AuthResponse register(Register registerRequest) ;
    public AuthResponse login(Login loginRequest) ;
    public UserResponse getCurrentUser(UserPrincipal currentUser) ;
}
