package com.ADP.peerConnect.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class DateUtilsTest {
    private static final LocalDateTime SAMPLE = LocalDateTime.of(2026, 11, 13, 15, 27, 54);

    @Test
    void formatsAndParsesDefaultRepresentation() {
        String formatted = DateUtils.format(SAMPLE);
        assertEquals("2026-11-13 15:27:54", formatted);
        assertEquals(SAMPLE, DateUtils.parse(formatted));
    }

    @Test
    void formatsAndParsesIsoRepresentation() {
        String formatted = DateUtils.formatISO(SAMPLE);
        assertEquals("2026-11-13T15:27:54", formatted);
        assertEquals(SAMPLE, DateUtils.parseISO(formatted));
    }

    @Test
    void handlesNullFormattingAndParsing() {
        assertNull(DateUtils.format(null));
        assertNull(DateUtils.formatISO(null));
        assertNull(DateUtils.parse(null));
        assertNull(DateUtils.parseISO(null));
    }

    @Test
    void identifiesPastAndFutureValues() {
        assertTrue(DateUtils.isPast(LocalDateTime.now().minusSeconds(1)));
        assertTrue(DateUtils.isFuture(LocalDateTime.now().plusSeconds(1)));
        assertFalse(DateUtils.isPast(null));
        assertFalse(DateUtils.isFuture(null));
    }
}
