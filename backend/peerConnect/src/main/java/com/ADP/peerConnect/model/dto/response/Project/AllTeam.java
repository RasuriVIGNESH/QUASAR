package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.UserCardResponse;
import lombok.Data;

import java.util.List;

@Data
public class AllTeam {
    private  UserCardResponse lead;
    List<UserCardResponse> members;
}
