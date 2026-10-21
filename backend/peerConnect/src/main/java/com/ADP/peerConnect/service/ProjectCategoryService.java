package com.ADP.peerConnect.service;
import com.ADP.peerConnect.exception.*;

import com.ADP.peerConnect.model.entity.ProjectCategory;
import com.ADP.peerConnect.repository.ProjectCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectCategoryService {
    @Autowired
    private final ProjectCategoryRepository projectCategoryRepository;

    public ProjectCategoryService(ProjectCategoryRepository projectCategoryRepository) {
        this.projectCategoryRepository = projectCategoryRepository;
    }
    public List<ProjectCategory> listAll() {
        return projectCategoryRepository.findAll();
    }

    public Optional<ProjectCategory> findByName(String name) {
        return projectCategoryRepository.findByName(name);
    }

    public Optional<ProjectCategory> findById(Long id) {
        return projectCategoryRepository.findById(id);
    }

    public ProjectCategory create(String categoryName) {
        if (projectCategoryRepository.findByName(categoryName).isPresent()) {
            throw new DuplicateCategoryException();
        }
        return projectCategoryRepository.save(new ProjectCategory(categoryName));
    }
}

