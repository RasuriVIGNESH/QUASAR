package com.ADP.peerConnect.security.oauth2;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.repository.UserRepository;
import com.ADP.peerConnect.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.*;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Autowired
    private UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (BadRequestException ex) {
            logger.warn("BadRequest in OAuth processing: {}", ex.getMessage());
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_request", ex.getMessage(), null), ex);
        } catch (Exception ex) {
            logger.error("Error processing OAuth2 user", ex);
            throw new OAuth2AuthenticationException(new OAuth2Error("server_error", "Error processing OAuth2 user", null), ex);
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        if (!"github".equalsIgnoreCase(registrationId)) {
            throw new BadRequestException("Unsupported OAuth2 provider: " + registrationId);
        }

        Map<String, Object> attributes =
                new HashMap<>(oauth2User.getAttributes());

        GitHubOAuth2UserInfo userInfo =
                new GitHubOAuth2UserInfo(attributes);


        String email = userInfo.getEmail();

        if (!StringUtils.hasText(email)) {
            logger.info("Primary email not found in /user response. Fetching /user/emails for access token.");
            String accessToken = userRequest.getAccessToken().getTokenValue();
            try {
                email = fetchPrimaryEmailFromGitHub(accessToken);
            } catch (Exception ex) {
                logger.warn("Failed to fetch email from /user/emails: {}", ex.getMessage());
            }
        }

        if (!StringUtils.hasText(email)) {
            throw new BadRequestException(
                    "Email not found from GitHub. Make sure 'user:email' scope is requested or user has a public/primary email."
            );
        }

// keep attributes in sync (optional but clean)
        userInfo.getAttributes().put("email", email);

        Optional<User> userOptionalByGithub = Optional.empty();
        if (StringUtils.hasText(userInfo.getId())) {
            userOptionalByGithub = userRepository.findByGithubId(userInfo.getId());
        }

        Optional<User> userOptionalByEmail = userRepository.findByEmail(userInfo.getEmail());

        User user;
        try {
            if (userOptionalByGithub.isPresent()) {
                user = userOptionalByGithub.get();
                user = updateExistingUser(user, userInfo);
            } else if (userOptionalByEmail.isPresent()) {
                user = userOptionalByEmail.get();
                user = updateExistingUser(user, userInfo);
            } else {
                user = registerNewUser(userInfo);
            }
        } catch (DataIntegrityViolationException dive) {
            logger.error("Database constraint violation while saving OAuth user: {}", dive.getMessage(), dive);
            throw new RuntimeException("Database error saving OAuth user: " + dive.getRootCause().getMessage(), dive);
        }

        return UserPrincipal.create(user);
    }

    /**
     * Call GitHub API /user/emails to get primary verified email if it's not returned in /user.
     */
    private String fetchPrimaryEmailFromGitHub(String accessToken) {
        try {
            String url = "https://api.github.com/user/emails";
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> emails = response.getBody();
                // find primary & verified email
                for (Map<String, Object> e : emails) {
                    Object primary = e.get("primary");
                    Object verified = e.get("verified");
                    Object email = e.get("email");
                    boolean isPrimary = primary instanceof Boolean && (Boolean) primary;
                    boolean isVerified = verified instanceof Boolean && (Boolean) verified;
                    if (isPrimary && isVerified && email != null) {
                        logger.info("Found primary verified email from /user/emails: {}", email);
                        return email.toString();
                    }
                }
                // fallback: return first verified email
                for (Map<String, Object> e : emails) {
                    Object verified = e.get("verified");
                    Object email = e.get("email");
                    boolean isVerified = verified instanceof Boolean && (Boolean) verified;
                    if (isVerified && email != null) {
                        logger.info("Found verified email from /user/emails: {}", email);
                        return email.toString();
                    }
                }
            }
        } catch (HttpClientErrorException hce) {
            logger.warn("GitHub /user/emails call failed with status {}: {}", hce.getStatusCode(), hce.getResponseBodyAsString());
        } catch (Exception ex) {
            logger.warn("Unexpected error calling GitHub /user/emails: {}", ex.getMessage());
        }
        return null;
    }

    private User registerNewUser(GitHubOAuth2UserInfo userInfo) {
        User user = new User();
        user.setEmail(userInfo.getEmail());
        String first = StringUtils.hasText(userInfo.getName()) ? userInfo.getName() : userInfo.getLogin();
        if (!StringUtils.hasText(first) || first.length() < 2) first = "GitHubUser";
        user.setFirstName(first);
        user.setLastName("---");
        user.setGithubId(userInfo.getId());
        user.setProfilePictureUrl(userInfo.getAvatarUrl());
        user.setIsVerified(true);
        user.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        user.setRole(Role.STUDENT);


        // default placeholders
        user.setBranch("Computer Science");
        user.setGraduationYear(2027);

        // create and encode a random password locally to satisfy entity validation
        String randomPassword = UUID.randomUUID().toString();
        String encoded = new BCryptPasswordEncoder().encode(randomPassword);
        user.setPassword(encoded);

        logger.info("Registering new OAuth user (email={}, githubId={})", user.getEmail(), user.getGithubId());
        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, GitHubOAuth2UserInfo userInfo) {
        if (!StringUtils.hasText(existingUser.getGithubId())) {
            existingUser.setGithubId(userInfo.getId());
        }

        if (StringUtils.hasText(userInfo.getAvatarUrl()) && !StringUtils.hasText(existingUser.getProfilePictureUrl())) {
            existingUser.setProfilePictureUrl(userInfo.getAvatarUrl());
        }

        if (StringUtils.hasText(userInfo.getName()) && (existingUser.getFirstName() == null ||
                userInfo.getName().length() > existingUser.getFirstName().length())) {
            existingUser.setFirstName(userInfo.getName());
        }

        return userRepository.save(existingUser);
    }
}
