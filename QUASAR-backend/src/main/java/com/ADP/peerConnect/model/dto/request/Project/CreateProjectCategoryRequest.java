package com.ADP.peerConnect.model.dto.request.Project;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class CreateProjectCategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 1, max = 200, message = "Category name must be between 1 and 200 characters")
    private String name;

    public CreateProjectCategoryRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

