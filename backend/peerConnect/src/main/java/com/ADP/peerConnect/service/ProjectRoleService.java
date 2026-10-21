package com.ADP.peerConnect.service;
import com.ADP.peerConnect.exception.*;

import com.ADP.peerConnect.model.dto.request.Project.ProjectRoleRequest;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectRole;
import com.ADP.peerConnect.model.enums.Status;
import com.ADP.peerConnect.repository.InvitationsAndRequestsRepository;
import com.ADP.peerConnect.repository.ProjectRoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectRoleService {
    private final ProjectRoleRepository roleRepository;
    private final InvitationsAndRequestsRepository requestsRepository;

    public ProjectRoleService(ProjectRoleRepository roleRepository,
                              InvitationsAndRequestsRepository requestsRepository) {
        this.roleRepository = roleRepository;
        this.requestsRepository = requestsRepository;
    }

    public void createRoles(Project project, List<ProjectRoleRequest> requests) {
        if (requests == null || requests.isEmpty()) return;
        validateRoleNames(requests);
        for (ProjectRoleRequest request : requests) {
            if (request.getId() != null) {
                throw new BadRequestException("Role IDs must not be supplied when creating a project.");
            }
            String name = cleanName(request.getName());
            validateNormalizedLength(name);
            project.getRequiredRoles().add(new ProjectRole(project, name, normalize(name)));
        }
    }

    public void synchronizeRoles(Project project, List<ProjectRoleRequest> requests) {
        if (requests == null) return; // omitted means leave existing roles unchanged
        validateRoleNames(requests);

        Map<Long, ProjectRole> existingById = project.getRequiredRoles().stream()
                .collect(Collectors.toMap(ProjectRole::getId, Function.identity()));
        List<Long> existingIds = project.getRequiredRoles().stream()
                .map(ProjectRole::getId).filter(id -> id != null).toList();
        Set<Long> referencedIds = existingIds.isEmpty() ? Set.of()
                : new HashSet<>(requestsRepository.findReferencedProjectRoleIds(existingIds));
        Set<Long> retainedIds = new HashSet<>();
        Set<Long> seenIds = new HashSet<>();

        for (ProjectRoleRequest request : requests) {
            String name = cleanName(request.getName());
            String normalized = normalize(name);
            validateNormalizedLength(name);
            if (request.getId() == null) {
                project.getRequiredRoles().add(new ProjectRole(project, name, normalized));
                continue;
            }
            if (!seenIds.add(request.getId())) {
                throw new DuplicateProjectRoleIdException();
            }
            ProjectRole role = existingById.get(request.getId());
            if (role == null) {
                throw new ResourceNotFoundException("Project role not found for this project.");
            }
            if (!role.getNormalizedName().equals(normalized)) {
                if (role.isFilled()) {
                    throw new RoleAlreadyFilledException();
                }
                if (referencedIds.contains(role.getId())) {
                    throw new ProjectRoleHistoryConflictException();
                }
                role.setName(name);
                role.setNormalizedName(normalized);
            }
            retainedIds.add(role.getId());
        }

        for (ProjectRole role : List.copyOf(project.getRequiredRoles())) {
            if (role.getId() == null || retainedIds.contains(role.getId())) continue;
            if (role.isFilled() || referencedIds.contains(role.getId())) {
                throw new ProjectRoleHistoryConflictException();
            }
            project.getRequiredRoles().remove(role);
        }
    }

    public void validateTeamCapacity(Project project) {
        int maxTeamSize = project.getMaxTeamSize() == null ? 0 : project.getMaxTeamSize();
        int roleSeats = project.getRequiredRoles() == null ? 0 : project.getRequiredRoles().size();
        if (roleSeats > Math.max(0, maxTeamSize - 1)) {
            throw new ProjectRoleCapacityExceededException();
        }
    }

    public ProjectRole requireOpenRole(String projectId, Long roleId) {
        List<ProjectRole> roles = roleRepository.findAllByProjectId(projectId);
        if (roles.isEmpty() && roleId == null) return null;
        if (roleId == null) {
            if (roles.stream().noneMatch(role -> !role.isFilled())) {
                throw new NoOpenRolesException();
            }
            throw new RoleSelectionRequiredException();
        }
        ProjectRole role = roleRepository.findByIdAndProjectIdForUpdate(roleId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found for this project."));
        if (role.isFilled()) {
            throw new RoleAlreadyFilledException();
        }
        return role;
    }

    @Transactional(readOnly = true)
    public boolean hasRequiredRoles(String projectId) {
        return roleRepository.existsAnyByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public boolean hasOpenRoles(String projectId) {
        return roleRepository.existsOpenByProjectId(projectId);
    }

    public ProjectRole lockOpenRole(String projectId, ProjectRole requestedRole) {
        if (requestedRole == null) return null;
        ProjectRole role = roleRepository.findByIdAndProjectIdForUpdate(
                        requestedRole.getId(), projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found for this project."));
        if (role.isFilled()) {
            throw new RoleAlreadyFilledException();
        }
        return role;
    }

    public void markExternallyFilled(String projectId, Long roleId) {
        ProjectRole role = roleRepository.findByIdAndProjectIdForUpdate(roleId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found for this project."));
        if (role.isFilled()) {
            throw new RoleAlreadyFilledException();
        }
        if (requestsRepository.existsByProjectRoleIdAndStatus(roleId,
                Status.PENDING)) {
            throw new PendingRoleCollaborationsException();
        }
        role.setFilled(true);
    }

    private void validateRoleNames(List<ProjectRoleRequest> requests) {
        Set<String> names = new HashSet<>();
        for (ProjectRoleRequest request : requests) {
            if (request == null || request.getName() == null || request.getName().isBlank()) {
                throw new BadRequestException("Every required role must have a non-blank name.");
            }
            String normalized = normalize(request.getName());
            validateNormalizedLength(cleanName(request.getName()));
            if (!names.add(normalized)) {
                throw new DuplicateProjectRoleNameException();
            }
        }
    }

    private String cleanName(String name) {
        return name.trim().replaceAll("\\s+", " ");
    }

    private String normalize(String name) {
        String decomposed = Normalizer.normalize(cleanName(name), Normalizer.Form.NFKC);
        return decomposed.toLowerCase(Locale.ROOT);
    }

    private void validateNormalizedLength(String name) {
        if (name.length() > 100 || normalize(name).length() > 100) {
            throw new BadRequestException("Role names must not exceed 100 characters after normalization.");
        }
    }
}
