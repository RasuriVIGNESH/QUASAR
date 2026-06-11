package com.ADP.peerConnect.util;

import java.util.regex.Pattern;

/**
 * Utility class for validation operations
 */
public final class ValidationUtils {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );
    
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$"
    );
    
    private ValidationUtils() {
        // Private constructor to prevent instantiation
    }
    
    /**
     * Validates email format
     */
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Validates password strength
     * Password must contain at least 8 characters, one uppercase, one lowercase, and one digit
     */
    public static boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }
    
    /**
     * Validates if string is not null or empty
     */
    public static boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }
    
    /**
     * Validates if string length is within range
     */
    public static boolean isValidLength(String str, int minLength, int maxLength) {
        if (str == null) return false;
        int length = str.trim().length();
        return length >= minLength && length <= maxLength;
    }
    
    /**
     * Validates graduation year
     */
    public static boolean isValidGraduationYear(Integer year) {
        return year != null && year >= Constants.MIN_GRADUATION_YEAR && year <= Constants.MAX_GRADUATION_YEAR;
    }
    
    /**
     * Validates team size
     */
    public static boolean isValidTeamSize(Integer size) {
        return size != null && size >= Constants.MIN_TEAM_SIZE && size <= Constants.MAX_TEAM_SIZE;
    }
    
    /**
     * Validates if branch is in allowed list
     */
    public static boolean isValidBranch(String branch) {
        if (branch == null) return false;
        for (String validBranch : Constants.BRANCHES) {
            if (validBranch.equalsIgnoreCase(branch.trim())) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Validates if project category is in allowed list
     */
    public static boolean isValidProjectCategory(String category) {
        if (category == null) return false;
        for (String validCategory : Constants.PROJECT_CATEGORIES) {
            if (validCategory.equalsIgnoreCase(category.trim())) {
                return true;
            }
        }
        return false;
    }
}

