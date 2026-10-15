package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.model.dto.request.PortfolioEntryRequest;
import com.ADP.peerConnect.model.dto.response.PortfolioEntryResponse;
import com.ADP.peerConnect.model.entity.PortfolioEntry;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.repository.PortfolioEntryRepository;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.TeamRepo;
import com.ADP.peerConnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@Service
public class PortfolioEntryService {
    private final PortfolioEntryRepository repository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepo teamRepository;

    public PortfolioEntryService(PortfolioEntryRepository repository, UserRepository userRepository,
                                 ProjectRepository projectRepository, TeamRepo teamRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
    }

    @Transactional(readOnly = true)
    public List<PortfolioEntryResponse> list(String projectId) {
        if (!projectRepository.existsById(projectId)) throw new ResourceNotFoundException("Project not found");
        return repository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(PortfolioEntryResponse::from)
                .toList();
    }

    @Transactional
    public PortfolioEntryResponse create(String ownerId, String projectId, PortfolioEntryRequest request) {
        validateUrl(request.url());
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!Boolean.TRUE.equals(teamRepository.isInTeam(projectId, ownerId))) {
            throw new UnauthorizedException("Only current project members can add contribution evidence");
        }
        return PortfolioEntryResponse.from(repository.save(new PortfolioEntry(
                owner, project, request.title().trim(), request.url().trim(), request.description())));
    }

    @Transactional
    public PortfolioEntryResponse update(String ownerId, String projectId, Long id, PortfolioEntryRequest request) {
        validateUrl(request.url());
        PortfolioEntry entry = repository.findByIdAndOwnerIdAndProjectId(id, ownerId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio entry not found"));
        entry.setTitle(request.title().trim());
        entry.setUrl(request.url().trim());
        entry.setDescription(request.description());
        return PortfolioEntryResponse.from(repository.save(entry));
    }

    @Transactional
    public void delete(String ownerId, String projectId, Long id) {
        PortfolioEntry entry = repository.findByIdAndOwnerIdAndProjectId(id, ownerId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio entry not found"));
        repository.delete(entry);
    }

    private void validateUrl(String value) {
        if (value == null || value.isBlank()) throw new BadRequestException("A portfolio URL is required");
        try {
            URI uri = new URI(value.trim());
            String scheme = uri.getScheme();
            if (uri.getHost() == null || scheme == null
                    || !(scheme.equalsIgnoreCase("https") || scheme.equalsIgnoreCase("http"))
                    || uri.getUserInfo() != null) {
                throw new BadRequestException("URL must be an absolute HTTP(S) URL without embedded credentials");
            }
        } catch (URISyntaxException ex) {
            throw new BadRequestException("URL must be an absolute HTTP(S) URL", ex);
        }
    }
}
