package com.ADP.peerConnect.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for date operations
 */
public final class DateUtils {
    
    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    private DateUtils() {
        // Private constructor to prevent instantiation
    }
    
    /**
     * Gets current timestamp
     */
    public static LocalDateTime now() {
        return LocalDateTime.now();
    }
    
    /**
     * Formats LocalDateTime to string using default format
     */
    public static String format(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DEFAULT_FORMATTER) : null;
    }
    
    /**
     * Formats LocalDateTime to ISO string
     */
    public static String formatISO(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(ISO_FORMATTER) : null;
    }
    
    /**
     * Parses string to LocalDateTime using default format
     */
    public static LocalDateTime parse(String dateTimeString) {
        return dateTimeString != null ? LocalDateTime.parse(dateTimeString, DEFAULT_FORMATTER) : null;
    }
    
    /**
     * Parses ISO string to LocalDateTime
     */
    public static LocalDateTime parseISO(String dateTimeString) {
        return dateTimeString != null ? LocalDateTime.parse(dateTimeString, ISO_FORMATTER) : null;
    }
    
    /**
     * Checks if date is in the past
     */
    public static boolean isPast(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isBefore(now());
    }
    
    /**
     * Checks if date is in the future
     */
    public static boolean isFuture(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isAfter(now());
    }
}

