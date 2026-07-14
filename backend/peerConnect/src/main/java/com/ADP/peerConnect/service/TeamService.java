package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.*;
import com.ADP.peerConnect.model.dto.response.Project.AllTeam;
import com.ADP.peerConnect.model.dto.response.UserCardResponse;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.repository.TeamRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TeamService {

    private static final Logger log = LoggerFactory.getLogger(TeamService.class);

    @Autowired private TeamRepo teamRepo;
    @Autowired private ProjectService projectService;

    // ── Internal: add member without lead check (used by invitation/join flow) ─
    public void addMember(String projectId, String memberId) {
        Project project = projectService.findById(projectId);

        if (project.getCurrentTeamSize() >= project.getMaxTeamSize()) {
            throw new ConflictException("Project team is now full");
        }
        if (teamRepo.existsByProjectIdAndUserId(projectId, memberId)) {
            throw new ConflictException("User is already a member of this project");
        }
        teamRepo.addMember(projectId, memberId);
        project.setCurrentTeamSize(project.getCurrentTeamSize() + 1);
    }

    // ── Remove member ─────────────────────────────────────────────────────────

    public void removeMemberFromTeam(String projectId, String memberId, String requesterId) {
        if (!projectService.isProjectLead(projectId, requesterId)) {
            throw new UnauthorizedException("Only project lead can remove members");
        }
        // Lead cannot be removed via this flow
        if (projectService.isProjectLead(projectId, memberId)) {
            throw new ConflictException("Cannot remove project lead");
        }
        if (!teamRepo.existsByProjectIdAndUserId(projectId, memberId)) {
            throw new ResourceNotFoundException("Member not found in this project");
        }

        teamRepo.removeMember(projectId, memberId);

        Project project = projectService.findById(projectId);
        project.setCurrentTeamSize(Math.max(0, project.getCurrentTeamSize() - 1));
    }

    // ── Leave project ─────────────────────────────────────────────────────────

    public void leaveProject(String projectId, String userId) {
        if (projectService.isProjectLead(projectId, userId)) {
            throw new ConflictException(
                    "Project lead cannot leave. Transfer leadership first or delete the project.");
        }
        if (!teamRepo.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ResourceNotFoundException("You are not a member of this project");
        }

        teamRepo.removeMember(projectId, userId);

        Project project = projectService.findById(projectId);
        project.setCurrentTeamSize(Math.max(0, project.getCurrentTeamSize() - 1));

        log.debug("User left projectId={} userId={}", projectId, userId);
    }

    // ── Get all team members ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AllTeam getAllTeam(String projectId, String currentUserId) {
        if (!teamRepo.isInTeam(projectId, currentUserId)) {
            throw new UnauthorizedException("Only project members can view the member list");
        }
        AllTeam team=new AllTeam();
        team.setMembers(teamRepo.getAllMembers(projectId)
                .stream()
                .map(UserCardResponse::new)
                .collect(Collectors.toList()));
        team.setLead(new UserCardResponse(teamRepo.getLead(projectId)));
        return team;
    }

    @Transactional(readOnly = true)
    public UserCardResponse getLead(String projectId){
        return new  UserCardResponse(teamRepo.getLead(projectId));
    }

    @Transactional(readOnly = true)
    public boolean isLead(String ProjectId,String UserId){
        return teamRepo.isLead(ProjectId, UserId);
    }
    @Transactional(readOnly = true)
    public boolean isProjectMember(String projectId, String userId) {
        return teamRepo.isInTeam(projectId, userId) || teamRepo.isLead(projectId, userId);
    }
}