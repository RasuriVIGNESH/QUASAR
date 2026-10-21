package com.ADP.peerConnect.exception;

/** Domain-specific conflict for ProjectNotRecruiting. */
public final class ProjectNotRecruitingException extends ConflictException {
    public ProjectNotRecruitingException() {
        super("This project is not recruiting new members.");
    }
}
