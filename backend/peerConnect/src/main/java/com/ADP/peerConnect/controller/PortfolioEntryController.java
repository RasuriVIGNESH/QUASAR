package com.ADP.peerConnect.controller;
import com.ADP.peerConnect.model.dto.request.PortfolioEntryRequest;
import com.ADP.peerConnect.model.dto.response.PortfolioEntryResponse;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.PortfolioEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequiredArgsConstructor @RequestMapping("/api/projects/{projectId}/portfolio")
public class PortfolioEntryController {
    private final PortfolioEntryService service;
    @GetMapping public ResponseEntity<List<PortfolioEntryResponse>> list(@PathVariable String projectId) { return ResponseEntity.ok(service.list(projectId)); }
    @PostMapping public ResponseEntity<PortfolioEntryResponse> create(@PathVariable String projectId,@Valid @RequestBody PortfolioEntryRequest request,@AuthenticationPrincipal UserPrincipal principal) { return ResponseEntity.ok(service.create(principal.getId(),projectId,request)); }
    @PutMapping("/{entryId}") public ResponseEntity<PortfolioEntryResponse> update(@PathVariable String projectId,@PathVariable Long entryId,@Valid @RequestBody PortfolioEntryRequest request,@AuthenticationPrincipal UserPrincipal principal) { return ResponseEntity.ok(service.update(principal.getId(),projectId,entryId,request)); }
    @DeleteMapping("/{entryId}") public ResponseEntity<Void> delete(@PathVariable String projectId,@PathVariable Long entryId,@AuthenticationPrincipal UserPrincipal principal) { service.delete(principal.getId(),projectId,entryId); return ResponseEntity.noContent().build(); }
}
