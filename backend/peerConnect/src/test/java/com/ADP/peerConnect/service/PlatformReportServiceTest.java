package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ClosedReportModificationException;
import com.ADP.peerConnect.model.dto.request.ModerationActionRequest;
import com.ADP.peerConnect.model.dto.request.ReportRequest;
import com.ADP.peerConnect.model.entity.PlatformReport;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.ReportReason;
import com.ADP.peerConnect.model.enums.ReportStatus;
import com.ADP.peerConnect.repository.PlatformReportRepository;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlatformReportServiceTest {
    @Mock PlatformReportRepository reports;
    @Mock UserRepository users;
    @Mock ProjectRepository projects;
    private PlatformReportService service;

    @BeforeEach void setUp() { service = new PlatformReportService(reports, users, projects); }

    @Test void createUserReportTrimsIdAndPersists() {
        User reporter = new User(); reporter.setId("r1"); User reported = new User(); reported.setId("u2");
        when(users.findById("r1")).thenReturn(Optional.of(reporter)); when(users.findById("u2")).thenReturn(Optional.of(reported));
        when(reports.save(any(PlatformReport.class))).thenAnswer(i -> i.getArgument(0));
        assertNotNull(service.create("r1", new ReportRequest(" ", " u2 ", ReportReason.SPAM, "bad")));
        verify(users).findById("u2"); verify(reports).save(any(PlatformReport.class));
    }

    @Test void createRejectsNeitherBothOrSelfTarget() {
        assertThrows(BadRequestException.class, () -> service.create("r1", new ReportRequest(null, null, ReportReason.OTHER, null)));
        assertThrows(BadRequestException.class, () -> service.create("r1", new ReportRequest("p1", "u2", ReportReason.OTHER, null)));
        User reporter = new User(); reporter.setId("r1"); when(users.findById("r1")).thenReturn(Optional.of(reporter));
        when(users.findById("r1")).thenReturn(Optional.of(reporter));
        assertThrows(BadRequestException.class, () -> service.create("r1", new ReportRequest(null, "r1", ReportReason.OTHER, null)));
    }

    @Test void pageRejectsInvalidBoundsAndUsesEmptyPageSafely() {
        assertThrows(BadRequestException.class, () -> service.page(null, -1, 10));
        assertThrows(BadRequestException.class, () -> service.page(null, 0, 101));
        when(reports.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of()));
        assertTrue(service.page(null, 0, 10).isEmpty());
    }

    @Test void moderateRejectsAlreadyClosedReport() {
        PlatformReport report = new PlatformReport(); report.setStatus(ReportStatus.RESOLVED);
        when(reports.findById(2L)).thenReturn(Optional.of(report));
        User admin = new User(); admin.setId("admin");
        when(users.findById("admin")).thenReturn(Optional.of(admin));
        assertThrows(ClosedReportModificationException.class,
                () -> service.moderate(2L, "admin", new ModerationActionRequest(ReportStatus.DISMISSED, "done")));
    }
}
