package com.ADP.peerConnect.model.dto.response;
import java.util.List;
public record MentorMatchResponse(String mentorUserId,String firstName,String lastName,String department,String designation,int score,List<String> matchedSkills) {}
