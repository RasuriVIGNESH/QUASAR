package com.ADP.peerConnect.service.Interface;


import com.ADP.peerConnect.model.entity.College;

import java.util.List;

public interface iCollegeService {

    public College createCollege(String name, String location);

    public void deleteCollege(Long id);

    public College getCollegeById(Long id);

    public List<College> getAllColleges();

    public College getCollegeByName(String name);

}
