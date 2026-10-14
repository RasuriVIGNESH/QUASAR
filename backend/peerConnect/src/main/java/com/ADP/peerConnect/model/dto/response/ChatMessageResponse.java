package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.ChatMessage;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageResponse {

    private Long id;
    private String message;
    private UserCardResponse sender;
    private LocalDateTime createdAt;

    public ChatMessageResponse(ChatMessage chatMessage) {
        this.id = chatMessage.getId();
        this.message = chatMessage.getMessage();
        this.createdAt = chatMessage.getCreatedAt();
        this.sender = new UserCardResponse(chatMessage.getSender());
    }
}
