package com.ADP.peerConnect.controller;
import com.ADP.peerConnect.model.dto.response.ProjectTemplateResponse;
import com.ADP.peerConnect.service.ProjectTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequiredArgsConstructor @RequestMapping("/api/project-templates")
public class ProjectTemplateController {
    private final ProjectTemplateService service;
    @GetMapping public ResponseEntity<List<ProjectTemplateResponse>> list(){return ResponseEntity.ok(service.list());}
    @GetMapping("/{key}") public ResponseEntity<ProjectTemplateResponse> get(@PathVariable String key){return ResponseEntity.ok(service.get(key));}
}
