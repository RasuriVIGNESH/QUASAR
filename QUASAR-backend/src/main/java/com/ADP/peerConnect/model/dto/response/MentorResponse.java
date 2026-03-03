package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.enums.Role;

public class MentorResponse {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String bio;
    private String branch;
    private String department;
    private String designation;
    private byte[] profilePhoto;


    public MentorResponse(String bio, String branch, String department, String designation, String email, String firstName, String id, String lastName, byte[] profilePhoto) {
        this.bio = bio;
        this.branch = branch;
        this.department = department;
        this.designation = designation;
        this.email = email;
        this.firstName = firstName;
        this.id = id;
        this.lastName = lastName;
        this.profilePhoto = profilePhoto;
    }

    public MentorResponse(){

    }
    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public byte[] getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(byte[] profilePhoto) {
        this.profilePhoto = profilePhoto;
    }
}
