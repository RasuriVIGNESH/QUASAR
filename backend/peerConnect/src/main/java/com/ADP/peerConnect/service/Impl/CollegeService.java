package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.College;
import com.ADP.peerConnect.repository.CollegeRepository;
import com.ADP.peerConnect.service.Interface.iCollegeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CollegeService implements iCollegeService {

    @Autowired
    private CollegeRepository collegeRepository; // Use the repository

    /**
     * Create a new college
     */
    @Override
    public College createCollege(String name, String location) {
        // Check if a college with this name already exists
        if (collegeRepository.existsByName(name)) {
            throw new ConflictException("A college with this name or code already exists.");
        }

        College college = new College(name, location);
        return collegeRepository.save(college);
    }

    /**
     * Delete a college by its ID
     */
    @Override
    public void deleteCollege(Long id) {
        College college = getCollegeById(id); // Reuse getCollegeById to check if it exists
        collegeRepository.delete(college);
    }

    /**
     * Get a single college by its ID
     */
    @Override
    public College getCollegeById(Long id) {
        return collegeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("College", "id", id));
    }

    /**
     * Get a list of all registered colleges
     */
    @Override
    public List<College> getAllColleges() {
        return collegeRepository.findAll();
    }

    /**
     * Get a single college by its name
     */
    @Override
    public College getCollegeByName(String name) {
        return collegeRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("College", "name", name));
    }

}