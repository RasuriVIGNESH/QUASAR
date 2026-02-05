package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.request.Auth.LoginRequest;
import com.ADP.peerConnect.model.dto.request.Auth.RegisterRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.AuthResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iAuthService;
import com.ADP.peerConnect.util.Constants;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Constants.AUTH_BASE_PATH)
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    @Autowired
    private iAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse authResponse = authService.register(registerRequest);
        ApiResponse<AuthResponse> response = ApiResponse.success("User registered successfully", authResponse);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.login(loginRequest);
        ApiResponse<AuthResponse> response = ApiResponse.success("Login successful", authResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse userResponse = authService.getCurrentUser(currentUser);
        ApiResponse<UserResponse> response = ApiResponse.success("User information retrieved", userResponse);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        ApiResponse<Void> response = ApiResponse.success("Logout successful");
        return ResponseEntity.ok(response);
    }

    /**
     * GitHub OAuth initiation endpoint (optional helper)
     * The frontend can redirect the browser to /oauth2/authorization/github directly,
     * or call this endpoint if you want a JSON response.
     */
    @GetMapping("/github")
    public ResponseEntity<ApiResponse<String>> githubAuth() {
        ApiResponse<String> response = ApiResponse.success("Redirecting to GitHub", "/oauth2/authorization/github");
        return ResponseEntity.ok(response);
    }
}
