package com.ADP.peerConnect.security.oauth2;

import java.util.Map;

/**
 * LinkedIn OAuth2 user information extractor
 */
public class LinkedInOAuth2UserInfo {
    
    private final Map<String, Object> attributes;
    
    public LinkedInOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }
    
    public String getId() {
        return (String) attributes.get("id");
    }
    
    public String getEmail() {
        return (String) attributes.get("emailAddress");
    }
    
    public String getFirstName() {
        Map<String, Object> firstName = (Map<String, Object>) attributes.get("firstName");
        if (firstName != null) {
            Map<String, Object> localized = (Map<String, Object>) firstName.get("localized");
            if (localized != null) {
                // LinkedIn returns localized names, get the first available
                return (String) localized.values().iterator().next();
            }
        }
        return null;
    }
    
    public String getLastName() {
        Map<String, Object> lastName = (Map<String, Object>) attributes.get("lastName");
        if (lastName != null) {
            Map<String, Object> localized = (Map<String, Object>) lastName.get("localized");
            if (localized != null) {
                // LinkedIn returns localized names, get the first available
                return (String) localized.values().iterator().next();
            }
        }
        return null;
    }
    
    public String getProfilePictureUrl() {
        Map<String, Object> profilePicture = (Map<String, Object>) attributes.get("profilePicture");
        if (profilePicture != null) {
            Map<String, Object> displayImage = (Map<String, Object>) profilePicture.get("displayImage");
            if (displayImage != null) {
                // Get the first available image URL
                Object elements = displayImage.get("elements");
                if (elements instanceof java.util.List) {
                    java.util.List<Map<String, Object>> elementsList = (java.util.List<Map<String, Object>>) elements;
                    if (!elementsList.isEmpty()) {
                        Map<String, Object> firstElement = elementsList.get(0);
                        java.util.List<Map<String, Object>> identifiers = 
                            (java.util.List<Map<String, Object>>) firstElement.get("identifiers");
                        if (identifiers != null && !identifiers.isEmpty()) {
                            return (String) identifiers.get(0).get("identifier");
                        }
                    }
                }
            }
        }
        return null;
    }
    
    public Map<String, Object> getAttributes() {
        return attributes;
    }
}

