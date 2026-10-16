package com.ADP.peerConnect.config;

import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

/** Prevents opening project-scoped REST routes after the project is soft-deleted. */
@Component
@RequiredArgsConstructor
public class ProjectDeletedInterceptor implements HandlerInterceptor {
    private static final String MESSAGE = "This project has been deleted and is no longer available.";

    private final ProjectRepository projectRepository;
    private final ObjectMapper objectMapper;

    @Override
    @SuppressWarnings("unchecked")
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Object rawVariables = request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (!(rawVariables instanceof Map<?, ?> variables)) {
            return true;
        }

        Object rawProjectId = variables.get("projectId");
        if (!(rawProjectId instanceof String projectId) || projectId.isBlank()) {
            return true;
        }

        if (projectRepository.findStatusById(projectId).orElse(null) != ProjectStatus.DELETED) {
            return true;
        }

        response.setStatus(HttpStatus.GONE.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), Map.of(
                "success", false,
                "status", HttpStatus.GONE.value(),
                "message", MESSAGE
        ));
        return false;
    }
}
