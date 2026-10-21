package com.ADP.peerConnect.exception;

public final class DuplicateProjectSkillException extends BadRequestException {
    public DuplicateProjectSkillException(String skillName) {
        super("Duplicate project skill: " + skillName);
    }
}
