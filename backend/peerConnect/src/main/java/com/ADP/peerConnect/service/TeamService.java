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
            throw new TeamFullException();
        }
        if (teamRepo.existsByProjectIdAndUserId(projectId, memberId)) {
            throw new AlreadyProjectMemberException();
        }
        teamRepo.addMember(projectId, memberId);
        project.setCurrentTeamSize(project.getCurrentTeamSize() + 1);
    }

    // ── Remove member ─────────────────────────────────────────────────────────

    public void removeMemberFromTeam(String projectId, String memberId, String requesterId) {
        Project project = projectService.findById(projectId);
        if (!projectService.isProjectLead(projectId, requesterId)) {
            throw new ForbiddenException("Only project lead can remove members");
        }
        // Lead cannot be removed via this flow
        if (projectService.isProjectLead(projectId, memberId)) {
            throw new ProjectLeadCannotBeRemovedException();
        }
        if (!teamRepo.existsByProjectIdAndUserId(projectId, memberId)) {
            throw new ResourceNotFoundException("Member not found in this project");
        }

        teamRepo.removeMember(projectId, memberId);
        project.setCurrentTeamSize(Math.max(0, project.getCurrentTeamSize() - 1));
    }

    // ── Leave project ─────────────────────────────────────────────────────────

    public void leaveProject(String projectId, String userId) {
        Project project = projectService.findById(projectId);
        if (projectService.isProjectLead(projectId, userId)) {
            throw new ProjectLeadCannotLeaveException();
        }
        if (!teamRepo.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ResourceNotFoundException("You are not a member of this project");
        }

        teamRepo.removeMember(projectId, userId);
        project.setCurrentTeamSize(Math.max(0, project.getCurrentTeamSize() - 1));

        log.debug("User left projectId={} userId={}", projectId, userId);
    }

    // ── Get all team members ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AllTeam getAllTeam(String projectId, String currentUserId) {
        projectService.findById(projectId);
        if (!teamRepo.isInTeam(projectId, currentUserId)) {
            throw new ForbiddenException("Only project members can view the member list");
        }
        AllTeam team=new AllTeam();
        team.setMembers(teamRepo.getAllMembers(projectId)
                .stream()
                .map(UserCardResponse::new)
                .collect(Collectors.toList()));
        User lead = teamRepo.getLead(projectId);
        if (lead == null) {
            throw new ResourceNotFoundException("Project lead not found");
        }
        team.setLead(new UserCardResponse(lead));
        return team;
    }

    @Transactional(readOnly = true)
    public UserCardResponse getLead(String projectId){
        projectService.findById(projectId);
        User lead = teamRepo.getLead(projectId);
        if (lead == null) {
            throw new ResourceNotFoundException("Project lead not found");
        }
        return new UserCardResponse(lead);
    }

    @Transactional(readOnly = true)
    public boolean isLead(String ProjectId,String UserId){
        return teamRepo.isLead(ProjectId, UserId);
    }
    @Transactional(readOnly = true)
    public boolean isProjectMember(String projectId, String userId) {
        return teamRepo.isInTeam(projectId, userId);
    }


    @Transactional
    public AllTeam updateLead(String projectId, String memberId, String currentUserId) {
        Team team = teamRepo.findTeamWithLeadAndMembers(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found for this project"));

        if (!team.getLead().getId().equals(currentUserId)) {
            throw new ForbiddenException("Only project lead can update members");
        }
        if (memberId.equals(currentUserId)) {
            throw new AlreadyProjectLeadException();
        }

        User newLead = team.getMembers().stream()
                .filter(m -> m.getId().equals(memberId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this project"));

        User oldLead = team.getLead();

        team.setLead(newLead);
        team.getMembers().remove(newLead);
        team.getMembers().add(oldLead);

        Team updatedTeam = teamRepo.save(team);

        AllTeam allTeam = new AllTeam();
        allTeam.setLead(new UserCardResponse(updatedTeam.getLead()));
        allTeam.setMembers(updatedTeam.getMembers().stream()
                .map(UserCardResponse::new)
                .collect(Collectors.toList()));
        return allTeam;
    }
}