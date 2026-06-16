package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.ChatMessage;
import com.ADP.peerConnect.model.enums.MessageType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageResponse {

    private Long id;
    private String message;
    private MessageType messageType;
    private String projectId;
    private UserResponse sender;

    private LocalDateTime createdAt;

    public ChatMessageResponse(ChatMessage message) {
    }
}