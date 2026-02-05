package com.ADP.peerConnect.security.oauth2;

import java.util.Map;

public class GitHubOAuth2UserInfo {
    private final Map<String, Object> attributes;

    public GitHubOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public String getId() {
        Object id = attributes.get("id");
        return id != null ? String.valueOf(id) : null;
    }

    public String getLogin() {
        return (String) attributes.get("login");
    }

    public String getName() {
        return (String) attributes.get("name");
    }

    public String getEmail() {
        // GitHub may not return email in /user. If null, you should request user:email
        return (String) attributes.get("email");
    }

    public String getAvatarUrl() {
        return (String) attributes.get("avatar_url");
    }

    // NEW: GitHub profile html URL (e.g., https://github.com/username)
    public String getHtmlUrl() {
        return (String) attributes.get("html_url");
    }

    // NEW: GitHub bio field
    public String getBio() {
        return (String) attributes.get("bio");
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }
}
