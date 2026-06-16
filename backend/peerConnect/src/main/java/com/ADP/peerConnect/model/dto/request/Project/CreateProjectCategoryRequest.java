package com.ADP.peerConnect.model.dto.request.Project;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
public class CreateProjectCategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 1, max = 200, message = "Category name must be between 1 and 200 characters")
    private String name;
}

