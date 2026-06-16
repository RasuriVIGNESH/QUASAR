package com.ADP.peerConnect.model.dto.request.Project;

import com.ADP.peerConnect.model.enums.ProjectRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@AllArgsConstructor
@NoArgsConstructor
@Setter @Getter
public class AddMemberRequest {
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Role is required")
    private ProjectRole role;

}