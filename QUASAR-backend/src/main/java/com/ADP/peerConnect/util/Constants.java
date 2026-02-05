package com.ADP.peerConnect.util;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Application constants
 */
public final class Constants {
    
    // JWT Constants
    public static final String JWT_TOKEN_PREFIX = "Bearer ";
    public static final String JWT_HEADER_STRING = "Authorization";
    public static final String JWT_AUTHORITIES_KEY = "authorities";
    
    // API Constants
    public static final String API_BASE_PATH = "/api";
    public static final String AUTH_BASE_PATH = API_BASE_PATH + "/auth";
    public static final String USER_BASE_PATH = API_BASE_PATH + "/users";
    public static final String PROJECT_BASE_PATH = API_BASE_PATH + "/projects";
    public static final String SKILL_BASE_PATH = API_BASE_PATH + "/skills";
    public static final String TEAM_BASE_PATH = API_BASE_PATH + "/team";
    public static final String NOTIFICATION_BASE_PATH = API_BASE_PATH + "/notifications";
    public static final String CHAT_BASE_PATH = API_BASE_PATH + "/chat";
    public static final String STATIC_DATA_BASE_PATH = API_BASE_PATH + "/static-data";
    public static final String DATA_BASE_PATH = API_BASE_PATH + "/data";
    public static final String PROJECT_CATEGORY_BASE_PATH = API_BASE_PATH + "/project-categories";

    // WebSocket Constants
    public static final String WS_BASE_PATH = "/ws";
    public static final String WS_NOTIFICATION_PATH = WS_BASE_PATH + "/notifications";
    public static final String WS_CHAT_PATH = WS_BASE_PATH + "/chat";
    
    // Pagination Constants
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    public static final String DEFAULT_SORT_DIRECTION = "DESC";
    public static final String DEFAULT_SORT_BY = "createdAt";
    
    // Validation Constants
    public static final int MIN_PASSWORD_LENGTH = 8;
    public static final int MAX_PASSWORD_LENGTH = 100;
    public static final int MIN_NAME_LENGTH = 2;
    public static final int MAX_NAME_LENGTH = 50;
    public static final int MIN_PROJECT_TITLE_LENGTH = 5;
    public static final int MAX_PROJECT_TITLE_LENGTH = 100;
    public static final int MIN_PROJECT_DESCRIPTION_LENGTH = 10;
    public static final int MAX_PROJECT_DESCRIPTION_LENGTH = 1000;
    public static final int MAX_BIO_LENGTH = 500;
    public static final int MIN_TEAM_SIZE = 2;
    public static final int MAX_TEAM_SIZE = 10;
    public static final int MIN_GRADUATION_YEAR = 2020;
    public static final int MAX_GRADUATION_YEAR = 2030;
    
    // File Upload Constants
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif"};
    
    // Static Data
    public static final String[] BRANCHES = {
        "Computer Science", "Information Technology", "Electronics and Communication",
        "Mechanical Engineering", "Civil Engineering", "Electrical Engineering",
        "Chemical Engineering", "Biotechnology", "Business Administration",
        "Data Science", "Artificial Intelligence", "Cybersecurity","Other"
    };
    
    public static final String[] PROJECT_CATEGORIES = {
        "Web Development", "Mobile App Development", "Data Science",
        "Machine Learning", "Artificial Intelligence", "Blockchain",
        "Game Development", "IoT", "Cybersecurity", "Research",
        "Business", "Design", "Other"
    };

    // Replaced flat skill list with a map of skill -> category so frontend receives structured data
    public static final Map<String, String> PREDEFINED_SKILLS_MAP;
    static {
        Map<String, String> skills = new LinkedHashMap<>();

        // Programming languages
        skills.put("Java", "Programming Language");
        skills.put("Python", "Programming Language");
        skills.put("JavaScript", "Programming Language");
        skills.put("C++", "Programming Language");
        skills.put("C#", "Programming Language");
        skills.put("Ruby", "Programming Language");
        skills.put("Swift", "Programming Language");
        skills.put("Kotlin", "Programming Language");
        skills.put("HTML", "Markup");
        skills.put("CSS", "Style Sheet");

        // Frontend frameworks / libraries
        skills.put("React", "Frontend Framework");
        skills.put("Angular", "Frontend Framework");
        skills.put("Vue.js", "Frontend Framework");

        // Backend / frameworks
        skills.put("Node.js", "Runtime / Backend");
        skills.put("Django", "Framework");
        skills.put("Flask", "Framework");
        skills.put("Spring Boot", "Framework");

        // Machine Learning / Data
        skills.put("TensorFlow", "Machine Learning");
        skills.put("PyTorch", "Machine Learning");
        skills.put("Machine Learning", "Topic");
        skills.put("Data Analysis", "Topic");

        // Databases
        skills.put("SQL", "Database");
        skills.put("NoSQL", "Database");

        // Cloud / DevOps / Tools
        skills.put("AWS", "Cloud");
        skills.put("Azure", "Cloud");
        skills.put("Docker", "DevOps Tool");
        skills.put("Kubernetes", "DevOps Tool");
        skills.put("Git", "Tool");

        // Other
        skills.put("UI/UX Design", "Design");
        skills.put("Project Management", "Management");

        PREDEFINED_SKILLS_MAP = Collections.unmodifiableMap(skills);
    }
    public static final String[] TeamRoles = {
        "Developer", "Designer", "Project Manager", "Tester",
        "DevOps Engineer", "Business Analyst", "Researcher",
        "Data Scientist", "Other"
    };
    
    // Error Messages
    public static final String USER_NOT_FOUND = "User not found";
    public static final String PROJECT_NOT_FOUND = "Project not found";
    public static final String SKILL_NOT_FOUND = "Skill not found";
    public static final String INVITATION_NOT_FOUND = "Invitation not found";
    public static final String NOTIFICATION_NOT_FOUND = "Notification not found";
    public static final String UNAUTHORIZED_ACCESS = "Unauthorized access";
    public static final String EMAIL_ALREADY_EXISTS = "Email already exists";
    public static final String INVALID_CREDENTIALS = "Invalid credentials";
    public static final String PROJECT_FULL = "Project team is full";
    public static final String ALREADY_MEMBER = "User is already a member of this project";
    public static final String INVITATION_ALREADY_SENT = "Invitation already sent to this user";
    
    private Constants() {
        // Private constructor to prevent instantiation
    }
}
