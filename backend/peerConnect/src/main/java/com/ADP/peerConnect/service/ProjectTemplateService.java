package com.ADP.peerConnect.service;
import com.ADP.peerConnect.model.dto.response.ProjectTemplateResponse;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class ProjectTemplateService {
    private final List<ProjectTemplateResponse> catalog=List.of(
        new ProjectTemplateResponse("hackathon-mvp","Hackathon MVP","A focused prototype with a measurable user outcome.",List.of("Java","React","SQL"),List.of("Problem","Users","MVP scope","Milestones","Demo")),
        new ProjectTemplateResponse("research-tool","Research Tool","A data-backed tool for collecting, analyzing, or presenting findings.",List.of("Python","Data Analysis","APIs"),List.of("Research question","Method","Data source","Evaluation","Limitations")),
        new ProjectTemplateResponse("campus-community","Campus Community","A collaboration or service experience for a campus community.",List.of("React","UX Design","Backend"),List.of("Community need","Personas","Core flows","Safety","Success metrics")),
        new ProjectTemplateResponse("open-source","Open Source Project","A maintainable contribution with clear setup and contribution guidance.",List.of("Git","Testing","Documentation"),List.of("Motivation","Architecture","Roadmap","Contribution guide","License")));
    public List<ProjectTemplateResponse> list(){return catalog;}
    public ProjectTemplateResponse get(String key){return catalog.stream().filter(t->t.key().equals(key)).findFirst().orElseThrow(()->new ResourceNotFoundException("Template not found"));}
}
