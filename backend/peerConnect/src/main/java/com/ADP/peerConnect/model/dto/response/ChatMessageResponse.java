package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.ChatMessage;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageResponse {

    private Long id;
    private String message;
    private UserCardResponse sender;
    private LocalDateTime createdAt;

    public ChatMessageResponse(ChatMessage message) {
        this.id=message.getId();
        this.message=message.getMessage();
        this.createdAt=message.getCreatedAt();
        this.sender=message.getUser();
    }
}