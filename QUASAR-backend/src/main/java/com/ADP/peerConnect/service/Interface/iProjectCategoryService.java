package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.entity.ProjectCategory;

import java.util.List;
import java.util.Optional;

public interface iProjectCategoryService {

    public List<ProjectCategory> listAll();
    public List<ProjectCategory> searchByName(String q) ;
    public Optional<ProjectCategory> findByName(String name);
    public Optional<ProjectCategory> findById(Long id);
    public ProjectCategory create(ProjectCategory category) ;
}
