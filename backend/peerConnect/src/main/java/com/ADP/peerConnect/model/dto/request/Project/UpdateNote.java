package com.ADP.peerConnect.model.dto.request.Project;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Getter
public class UpdateNote {

    @NotBlank(message = "Note title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;
    private String content;
}
