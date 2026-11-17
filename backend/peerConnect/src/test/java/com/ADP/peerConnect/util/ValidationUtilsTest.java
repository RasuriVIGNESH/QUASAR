package com.ADP.peerConnect.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ValidationUtilsTest {
    @Test
    void validatesEmailBoundaries() {
        assertTrue(ValidationUtils.isValidEmail("person@example.com"));
        assertTrue(ValidationUtils.isValidEmail("first.last+tag@example.co.uk"));
        assertFalse(ValidationUtils.isValidEmail(null));
        assertFalse(ValidationUtils.isValidEmail("person@example"));
        assertFalse(ValidationUtils.isValidEmail("person @example.com"));
    }

    @Test
    void validatesPasswordStrengthAndAllowedCharacters() {
        assertTrue(ValidationUtils.isValidPassword("Strong123"));
        assertTrue(ValidationUtils.isValidPassword("Abcd1234@$"));
        assertFalse(ValidationUtils.isValidPassword("short1A"));
        assertFalse(ValidationUtils.isValidPassword("alllowercase1"));
        assertFalse(ValidationUtils.isValidPassword("ALLUPPERCASE1"));
        assertFalse(ValidationUtils.isValidPassword("NoDigitsHere"));
        assertFalse(ValidationUtils.isValidPassword("Valid123-"));
        assertFalse(ValidationUtils.isValidPassword(null));
    }

    @Test
    void validatesTrimmedTextAndLength() {
        assertTrue(ValidationUtils.isNotEmpty("  value  "));
        assertFalse(ValidationUtils.isNotEmpty("   "));
        assertFalse(ValidationUtils.isNotEmpty(null));
        assertTrue(ValidationUtils.isValidLength("  abc  ", 3, 3));
        assertFalse(ValidationUtils.isValidLength("ab", 3, 5));
        assertFalse(ValidationUtils.isValidLength(null, 1, 5));
    }

    @Test
    void validatesInclusiveDomainBoundaries() {
        assertTrue(ValidationUtils.isValidGraduationYear(Constants.MIN_GRADUATION_YEAR));
        assertTrue(ValidationUtils.isValidGraduationYear(Constants.MAX_GRADUATION_YEAR));
        assertFalse(ValidationUtils.isValidGraduationYear(Constants.MIN_GRADUATION_YEAR - 1));
        assertTrue(ValidationUtils.isValidTeamSize(Constants.MIN_TEAM_SIZE));
        assertTrue(ValidationUtils.isValidTeamSize(Constants.MAX_TEAM_SIZE));
        assertFalse(ValidationUtils.isValidTeamSize(Constants.MAX_TEAM_SIZE + 1));
        assertTrue(ValidationUtils.isValidBranch("  computer science "));
        assertTrue(ValidationUtils.isValidProjectCategory("WEB DEVELOPMENT"));
        assertFalse(ValidationUtils.isValidBranch("Unknown branch"));
        assertFalse(ValidationUtils.isValidProjectCategory(null));
    }
}
