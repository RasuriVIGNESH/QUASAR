package com.ADP.peerConnect.model.dto.response;
import java.util.List;
public record ProjectTemplateResponse(String key,String name,String summary,List<String> suggestedSkills,List<String> suggestedSections) {}
