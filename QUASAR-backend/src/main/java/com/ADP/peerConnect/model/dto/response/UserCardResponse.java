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
}