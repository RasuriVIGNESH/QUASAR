package com.ADP.peerConnect.security.oauth2;

import com.ADP.peerConnect.security.JwtTokenProvider;
import com.ADP.peerConnect.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final JwtTokenProvider tokenProvider;

    public OAuth2AuthenticationSuccessHandler(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }


    @Value("${frontendURL}")
    private String frontendOrigins;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        if (response.isCommitted()) {
            logger.warn("Response already committed. Can't redirect.");
            return;
        }

        try {
            String targetUrl = determineTargetUrl(request, response, authentication);
            logger.info("OAuth2 login successful. Redirecting to: {}", targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception ex) {
            logger.error("Error in OAuth2AuthenticationSuccessHandler: {}", ex.getMessage(), ex);
            getRedirectStrategy().sendRedirect(request, response, frontendOrigins + "/");
        } finally {
            clearAuthenticationAttributes(request);
        }
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) {

        String redirectBase = frontendOrigins;
        if (redirectBase.isEmpty()) {
            redirectBase = "http://localhost:5173";
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateTokenFromUserId(
                principal.getId(),
                principal.getEmail(),
                principal.getFirstName(),
                principal.getLastName()
        );

        String url = UriComponentsBuilder.fromUriString(redirectBase)
                .path("/auth/oauth2/redirect")
                .queryParam("token", token)
                .build()
                .toUriString();

        logger.debug("Built OAuth2 redirect URL: {}", url);
        return url;
    }
}
