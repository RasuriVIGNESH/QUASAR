package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.User;

public class UserCardResponse {

    private String id;
    private String firstName;
    private String lastName;
    private String profilePictureUrl;
    private String branch;

    public UserCardResponse(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.profilePictureUrl = user.getProfilePictureUrl();
        this.branch = user.getBranch();
    }
    public String getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public String getBranch() {
        return branch;
    }
}