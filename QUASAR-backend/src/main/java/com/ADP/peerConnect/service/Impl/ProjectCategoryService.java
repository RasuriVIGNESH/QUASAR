package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.model.entity.ProjectCategory;
import com.ADP.peerConnect.repository.ProjectCategoryRepository;
import com.ADP.peerConnect.service.Interface.iProjectCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectCategoryService implements iProjectCategoryService {
    @Autowired
    private final ProjectCategoryRepository projectCategoryRepository;


    public ProjectCategoryService(ProjectCategoryRepository projectCategoryRepository) {
        this.projectCategoryRepository = projectCategoryRepository;
    }

    public List<ProjectCategory> listAll() {
        return projectCategoryRepository.findAll();
    }

    public List<ProjectCategory> searchByName(String q) {
        return projectCategoryRepository.findByNameContainingIgnoreCase(q);
    }

    public Optional<ProjectCategory> findByName(String name) {
        return projectCategoryRepository.findByName(name);
    }

    public Optional<ProjectCategory> findById(Long id) {
        return projectCategoryRepository.findById(id);
    }

    public ProjectCategory create(ProjectCategory category) {
        Optional<ProjectCategory> existing = projectCategoryRepository.findByName(category.getName());
        return existing.orElseGet(() -> projectCategoryRepository.save(category));
    }
}

