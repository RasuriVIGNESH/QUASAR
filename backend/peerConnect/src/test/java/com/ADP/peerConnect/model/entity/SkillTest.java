package com.ADP.peerConnect.model.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SkillTest {
    @Test
    void normalizesWhitespaceAndCase() {
        assertEquals("spring boot", Skill.normalizeName("  Spring   Boot "));
        Skill skill = new Skill("  Spring Boot ", "Framework");
        assertEquals("spring boot", skill.getNormalizedName());
        assertEquals("Framework", skill.getCategory());
    }

    @Test
    void rejectsNullOrBlankSkillNames() {
        assertThrows(IllegalArgumentException.class, () -> Skill.normalizeName(null));
        assertThrows(IllegalArgumentException.class, () -> Skill.normalizeName("   "));
    }

    @Test
    void tracksUserCountThroughDomainAccessor() {
        Skill skill = new Skill("Java", "Programming Language");
        skill.setUsersCount(4);
        assertEquals(4, skill.getUsersCount());
    }
}
