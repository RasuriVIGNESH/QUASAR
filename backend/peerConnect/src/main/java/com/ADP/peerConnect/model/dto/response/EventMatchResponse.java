package com.ADP.peerConnect.model.dto.response;
import com.ADP.peerConnect.model.enums.EventStatus;
import java.time.LocalDate;
import java.util.List;
public record EventMatchResponse(Long eventId,String name,String description,EventStatus status,LocalDate startDate,LocalDate endDate,int score,List<String> matchedSkills) {}
