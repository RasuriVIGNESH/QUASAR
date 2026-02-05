package com.ADP.peerConnect.model.dto.request.User;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * Create skill request DTO
 */
public class CreateSkillRequest {
    
    @NotBlank(message = "Skill name is required")
    @Size(min = 2, max = 100, message = "Skill name must be between 2 and 100 characters")
    private String name;
    
    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;
    
    public CreateSkillRequest() {}
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
}

