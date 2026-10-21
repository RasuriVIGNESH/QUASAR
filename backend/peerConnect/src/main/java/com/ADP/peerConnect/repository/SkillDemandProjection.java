package com.ADP.peerConnect.repository;

/** Aggregated project demand for one skill; values are distinct-project counts. */
public interface SkillDemandProjection {
    Long getSkillId();
    String getSkillName();
    String getCategory();
    Long getActiveProjectCount();
    Long getRecruitingProjectCount();
    Long getInProgressProjectCount();
}
