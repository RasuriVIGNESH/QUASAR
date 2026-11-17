package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.response.AuthResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.AuthService;
import com.ADP.peerConnect.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.http.MediaType.APPLICATION_JSON;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerMvcTest {
    @Autowired MockMvc mvc;
    @MockBean AuthService authService;
    @MockBean ProjectRepository projectRepository;

    private UserPrincipal principal() {
        return new UserPrincipal("user-1", "ada@example.com", "encoded", "Ada", "Lovelace",
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
    }
    private UsernamePasswordAuthenticationToken authenticationToken() {
        UserPrincipal p = principal();
        return new UsernamePasswordAuthenticationToken(p, null, p.getAuthorities());
    }

    @Test
    void registerRejectsInvalidPayloadAndDoesNotCallService() throws Exception {
        mvc.perform(post("/api/auth/register").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()).contentType(APPLICATION_JSON)
                        .content("{\"email\":\"bad\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.email").exists())
                .andExpect(jsonPath("$.validationErrors.password").value("Password must be at least 8 characters"));
    }

    @Test
    void loginReturnsBearerTokenAndDelegatesValidatedRequest() throws Exception {
        when(authService.login(any())).thenReturn(new AuthResponse("token-123", new UserResponse("user-1", "ada@example.com", "Ada", "Lovelace")));

        mvc.perform(post("/api/auth/login").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()).contentType(APPLICATION_JSON)
                        .content("{\"email\":\"ada@example.com\",\"password\":\"correct-password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.accessToken").value("token-123"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
        verify(authService).login(any());
    }

    @Test
    void currentUserRejectsMissingCustomPrincipal() throws Exception {
        mvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("User not authenticated"));
        verify(authService, org.mockito.Mockito.never()).getCurrentUser(any());
    }
}
