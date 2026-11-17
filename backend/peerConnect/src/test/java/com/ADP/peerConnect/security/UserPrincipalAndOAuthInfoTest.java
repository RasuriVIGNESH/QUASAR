package com.ADP.peerConnect.security;

import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.security.oauth2.GitHubOAuth2UserInfo;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class UserPrincipalAndOAuthInfoTest {
    @Test
    void principalExposesIdentityAndRoleAuthority() {
        User user = new User();
        user.setId("u-1");
        user.setEmail("ada@example.com");
        user.setPassword("encoded");
        user.setFirstName("Ada");
        user.setLastName("Lovelace");
        user.setRole(Role.STUDENT);

        UserPrincipal principal = UserPrincipal.create(user);

        assertEquals("u-1", principal.getId());
        assertEquals("ada@example.com", principal.getUsername());
        assertEquals("ada@example.com", principal.getName());
        assertEquals("encoded", principal.getPassword());
        assertTrue(principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT")));
        assertTrue(principal.isEnabled());
        assertTrue(principal.getAttributes().isEmpty());
    }

    @Test
    void mapsGitHubAttributesIncludingNullableOptionalFields() {
        GitHubOAuth2UserInfo info = new GitHubOAuth2UserInfo(Map.of(
                "id", 12345,
                "login", "adalovelace",
                "name", "Ada Lovelace",
                "email", "ada@example.com",
                "avatar_url", "https://avatar.example/a.png",
                "html_url", "https://github.com/adalovelace",
                "bio", "Analytical engine enthusiast"
        ));

        assertEquals("12345", info.getId());
        assertEquals("adalovelace", info.getLogin());
        assertEquals("Ada Lovelace", info.getName());
        assertEquals("ada@example.com", info.getEmail());
        assertEquals("https://avatar.example/a.png", info.getAvatarUrl());
        assertEquals("https://github.com/adalovelace", info.getHtmlUrl());
        assertEquals("Analytical engine enthusiast", info.getBio());
        assertSame(info.getAttributes(), info.getAttributes());
    }
}
