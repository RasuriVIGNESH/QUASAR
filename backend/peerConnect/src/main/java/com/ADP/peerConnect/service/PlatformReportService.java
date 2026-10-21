package com.ADP.peerConnect.service;
import com.ADP.peerConnect.exception.*;

import com.ADP.peerConnect.model.dto.request.ModerationActionRequest;
import com.ADP.peerConnect.model.dto.request.ReportRequest;
import com.ADP.peerConnect.model.dto.response.ReportResponse;
import com.ADP.peerConnect.model.entity.PlatformReport;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.ReportStatus;
import com.ADP.peerConnect.repository.PlatformReportRepository;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformReportService {
    private static final int MAX_PAGE_SIZE = 100;

    private final PlatformReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public PlatformReportService(PlatformReportRepository reportRepository, UserRepository userRepository,
                                 ProjectRepository projectRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional
    public ReportResponse create(String reporterId, ReportRequest request) {
        String projectId = normalize(request.projectId());
        String reportedUserId = normalize(request.userId());
        if ((projectId == null) == (reportedUserId == null)) {
            throw new BadRequestException("Report exactly one project or user");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));
        Project project = projectId == null ? null : projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        User reportedUser = reportedUserId == null ? null : userRepository.findById(reportedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (reportedUser != null && reporterId.equals(reportedUser.getId())) {
            throw new BadRequestException("A user cannot report themselves");
        }

        PlatformReport report = reportRepository.save(new PlatformReport(
                reporter, project, reportedUser, request.reason(), request.description()));
        return ReportResponse.from(report);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> page(ReportStatus status, int page, int size) {
        validatePage(page, size);
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<PlatformReport> reports = status == null
                ? reportRepository.findAll(pageable)
                : reportRepository.findByStatusOrderByCreatedAtAsc(status, pageable);
        return reports.map(ReportResponse::from);
    }

    @Transactional
    public ReportResponse moderate(Long id, String adminId, ModerationActionRequest request) {
        PlatformReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        if (report.getStatus() == ReportStatus.RESOLVED || report.getStatus() == ReportStatus.DISMISSED) {
            throw new ClosedReportModificationException();
        }
        report.setStatus(request.status());
        report.setModerationNote(request.note());
        report.setReviewedBy(admin);
        return ReportResponse.from(reportRepository.save(report));
    }

    private void validatePage(int page, int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("page must be >= 0 and size must be between 1 and " + MAX_PAGE_SIZE);
        }
    }

    private String normalize(String id) {
        return id == null || id.isBlank() ? null : id.trim();
    }
}
