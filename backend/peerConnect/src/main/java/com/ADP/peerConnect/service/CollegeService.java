package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.*;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.College;
import com.ADP.peerConnect.repository.CollegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CollegeService{

    @Autowired
    private CollegeRepository collegeRepository; // Use the repository


    public College createCollege(String name, String location) {
        // Check if a college with this name already exists
        if (collegeRepository.existsByName(name)) {
            throw new DuplicateCollegeException();
        }

        College college = new College(name, location);
        return collegeRepository.save(college);
    }


    public void deleteCollege(Long id) {
        College college = getCollegeById(id); // Reuse getCollegeById to check if it exists
        collegeRepository.delete(college);
    }


    public College getCollegeById(Long id) {
        return collegeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("College", "id", id));
    }

    public List<College> getAllColleges() {
        return collegeRepository.findAll();
    }

    public College getCollegeByName(String name) {
        return collegeRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("College", "name", name));
    }

}