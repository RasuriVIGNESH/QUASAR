package com.ADP.peerConnect.repository;
import com.ADP.peerConnect.model.entity.PlatformReport;
import com.ADP.peerConnect.model.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PlatformReportRepository extends JpaRepository<PlatformReport, Long> {
    Page<PlatformReport> findByStatusOrderByCreatedAtAsc(ReportStatus status, Pageable pageable);
}
