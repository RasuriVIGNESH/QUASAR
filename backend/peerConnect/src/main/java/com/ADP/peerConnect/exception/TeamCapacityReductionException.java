package com.ADP.peerConnect.exception;

/** Domain-specific conflict for TeamCapacityReduction. */
public final class TeamCapacityReductionException extends ConflictException {
    public TeamCapacityReductionException() {
        super("Maximum team size cannot be lower than the current team size.");
    }
}
