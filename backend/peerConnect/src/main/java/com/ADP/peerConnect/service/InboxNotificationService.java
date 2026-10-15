package com.ADP.peerConnect.service;

import com.ADP.peerConnect.model.dto.response.NotificationResponse;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.enums.NotificationEventType;
import com.ADP.peerConnect.repository.*;
import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class InboxNotificationService {
    private final InboxNotificationRepository repository; private final UserRepository userRepository;
    @Transactional public NotificationResponse create(String recipientId, NotificationEventType type, String title, String message, String projectId, String userId) { User u=userRepository.findById(recipientId).orElseThrow(()->new ResourceNotFoundException("Recipient not found")); return NotificationResponse.from(repository.save(new InboxNotification(u,type,title,message,projectId,userId))); }
    @Transactional(readOnly=true) public Page<NotificationResponse> page(String userId,int page,int size) { validate(page,size); return repository.findByRecipientIdOrderByCreatedAtDesc(userId,PageRequest.of(page,size)).map(NotificationResponse::from); }
    @Transactional(readOnly=true) public long unreadCount(String userId) { return repository.countByRecipientIdAndReadAtIsNull(userId); }
    @Transactional public void markRead(String userId,String id) { if(repository.markRead(id,userId)==0) throw new ResourceNotFoundException("Notification not found"); }
    @Transactional public int markAllRead(String userId) { return repository.markAllRead(userId); }
    private void validate(int page,int size) { if(page<0||size<1||size>100) throw new BadRequestException("page must be >= 0 and size must be between 1 and 100"); }
}
