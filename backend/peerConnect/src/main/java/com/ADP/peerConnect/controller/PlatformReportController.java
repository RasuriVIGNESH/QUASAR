package com.ADP.peerConnect.controller;
import com.ADP.peerConnect.model.dto.request.*;
import com.ADP.peerConnect.model.dto.response.ReportResponse;
import com.ADP.peerConnect.model.enums.ReportStatus;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.PlatformReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor
public class PlatformReportController {
    private final PlatformReportService service;
    @PostMapping("/api/reports") public ResponseEntity<ReportResponse> create(@Valid @RequestBody ReportRequest request,@AuthenticationPrincipal UserPrincipal principal) { return ResponseEntity.ok(service.create(principal.getId(),request)); }
    @GetMapping("/api/admin/reports") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<Page<ReportResponse>> list(@RequestParam(required=false) ReportStatus status,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size) { return ResponseEntity.ok(service.page(status,page,size)); }
    @PatchMapping("/api/admin/reports/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<ReportResponse> moderate(@PathVariable Long id,@Valid @RequestBody ModerationActionRequest request,@AuthenticationPrincipal UserPrincipal principal) { return ResponseEntity.ok(service.moderate(id,principal.getId(),request)); }
}
