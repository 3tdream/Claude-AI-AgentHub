// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Availability Service Tests
// Unit tests for the slot calculation algorithm (pure functions)
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  parseTime,
  formatTime,
  rangesOverlap,
  generateSlots,
  localToUtcIso,
  type SlotGenerationInput,
} from '../../src/backend/services/availability.service';

// ============================================================================
// parseTime
// ============================================================================

describe('parseTime', () => {
  it('parses midnight as 0 minutes', () => {
    expect(parseTime('00:00')).toBe(0);
  });

  it('parses 09:00 as 540 minutes', () => {
    expect(parseTime('09:00')).toBe(540);
  });

  it('parses 13:30 as 810 minutes', () => {
    expect(parseTime('13:30')).toBe(810);
  });

  it('parses 23:59 as 1439 minutes', () => {
    expect(parseTime('23:59')).toBe(1439);
  });
});

// ============================================================================
// formatTime
// ============================================================================

describe('formatTime', () => {
  it('formats 0 minutes as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats 540 minutes as 09:00', () => {
    expect(formatTime(540)).toBe('09:00');
  });

  it('formats 810 minutes as 13:30', () => {
    expect(formatTime(810)).toBe('13:30');
  });

  it('formats 1439 minutes as 23:59', () => {
    expect(formatTime(1439)).toBe('23:59');
  });

  it('round-trips with parseTime', () => {
    const times = ['00:00', '06:15', '09:00', '12:30', '18:45', '23:59'];
    for (const time of times) {
      expect(formatTime(parseTime(time))).toBe(time);
    }
  });
});

// ============================================================================
// rangesOverlap
// ============================================================================

describe('rangesOverlap', () => {
  it('returns true for overlapping ranges', () => {
    expect(rangesOverlap(540, 600, 570, 630)).toBe(true);
  });

  it('returns true for one range containing another', () => {
    expect(rangesOverlap(540, 660, 570, 600)).toBe(true);
  });

  it('returns false for adjacent ranges (no overlap)', () => {
    // [540, 600) and [600, 660) — half-open intervals do not overlap
    expect(rangesOverlap(540, 600, 600, 660)).toBe(false);
  });

  it('returns false for non-overlapping ranges', () => {
    expect(rangesOverlap(540, 600, 660, 720)).toBe(false);
  });

  it('returns true when ranges share a single point (start of A = end of B)', () => {
    // [600, 660) and [540, 601) — overlap at minute 600
    expect(rangesOverlap(600, 660, 540, 601)).toBe(true);
  });

  it('returns false for identical zero-length ranges', () => {
    expect(rangesOverlap(600, 600, 600, 600)).toBe(false);
  });
});

// ============================================================================
// generateSlots — core slot algorithm
// ============================================================================

describe('generateSlots', () => {
  // Helper to create input with defaults
  function makeInput(overrides: Partial<SlotGenerationInput> = {}): SlotGenerationInput {
    return {
      workStart: '09:00',
      workEnd: '18:00',
      durationMin: 60,
      slotInterval: 30,
      bufferMinutes: 0,
      existingBookings: [],
      ...overrides,
    };
  }

  // ---- Basic slot generation ----

  it('generates correct number of slots for a full day with no bookings', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '18:00',
      durationMin: 60,
      slotInterval: 60,
    });

    const slots = generateSlots(input);

    // 09:00-10:00, 10:00-11:00, ..., 17:00-18:00 = 9 slots
    expect(slots).toHaveLength(9);
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it('generates slots with 30-min interval and 60-min duration', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '12:00',
      durationMin: 60,
      slotInterval: 30,
    });

    const slots = generateSlots(input);

    // Slots starting at: 09:00, 09:30, 10:00, 10:30, 11:00 (11:00+60=12:00 <= 12:00)
    // 11:30+60=12:30 > 12:00 — does not fit
    expect(slots).toHaveLength(5);

    // Verify first slot
    expect(slots[0]).toEqual({
      startMin: 540, // 09:00
      endMin: 600,   // 10:00
      available: true,
    });

    // Verify last slot
    expect(slots[4]).toEqual({
      startMin: 660, // 11:00
      endMin: 720,   // 12:00
      available: true,
    });
  });

  it('returns empty array if work window is too short for service', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '09:30',
      durationMin: 60,
    });

    const slots = generateSlots(input);
    expect(slots).toHaveLength(0);
  });

  it('returns single slot if work window exactly fits one service', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '10:00',
      durationMin: 60,
      slotInterval: 30,
    });

    const slots = generateSlots(input);
    expect(slots).toHaveLength(1);
    expect(slots[0]).toEqual({
      startMin: 540,
      endMin: 600,
      available: true,
    });
  });

  // ---- Overlap detection ----

  it('marks slots as unavailable when they overlap with existing bookings', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '12:00',
      durationMin: 60,
      slotInterval: 60,
      existingBookings: [
        { startMin: 600, endMin: 660 }, // 10:00-11:00 booked
      ],
    });

    const slots = generateSlots(input);

    // 09:00-10:00 — available (no overlap with 10:00-11:00)
    expect(slots[0].available).toBe(true);

    // 10:00-11:00 — unavailable (exact overlap)
    expect(slots[1].available).toBe(false);

    // 11:00-12:00 — available
    expect(slots[2].available).toBe(true);
  });

  it('marks partially overlapping slots as unavailable', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '12:00',
      durationMin: 60,
      slotInterval: 30,
      existingBookings: [
        { startMin: 600, endMin: 660 }, // 10:00-11:00 booked
      ],
    });

    const slots = generateSlots(input);

    // 09:00-10:00 — available (adjacent, no overlap)
    expect(slots.find((s) => s.startMin === 540)?.available).toBe(true);

    // 09:30-10:30 — unavailable (overlaps 10:00-10:30 with booking)
    expect(slots.find((s) => s.startMin === 570)?.available).toBe(false);

    // 10:00-11:00 — unavailable (full overlap)
    expect(slots.find((s) => s.startMin === 600)?.available).toBe(false);

    // 10:30-11:30 — unavailable (overlaps 10:30-11:00 with booking)
    expect(slots.find((s) => s.startMin === 630)?.available).toBe(false);

    // 11:00-12:00 — available (booking ends at 11:00, half-open interval)
    expect(slots.find((s) => s.startMin === 660)?.available).toBe(true);
  });

  it('handles multiple existing bookings', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '15:00',
      durationMin: 60,
      slotInterval: 60,
      existingBookings: [
        { startMin: 540, endMin: 600 },  // 09:00-10:00 booked
        { startMin: 720, endMin: 780 },  // 12:00-13:00 booked
      ],
    });

    const slots = generateSlots(input);

    expect(slots.find((s) => s.startMin === 540)?.available).toBe(false); // 09:00
    expect(slots.find((s) => s.startMin === 600)?.available).toBe(true);  // 10:00
    expect(slots.find((s) => s.startMin === 660)?.available).toBe(true);  // 11:00
    expect(slots.find((s) => s.startMin === 720)?.available).toBe(false); // 12:00
    expect(slots.find((s) => s.startMin === 780)?.available).toBe(true);  // 13:00
    expect(slots.find((s) => s.startMin === 840)?.available).toBe(true);  // 14:00
  });

  // ---- Buffer minutes ----

  it('applies buffer minutes to exclude adjacent slots', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '13:00',
      durationMin: 60,
      slotInterval: 60,
      bufferMinutes: 15,
      existingBookings: [
        { startMin: 600, endMin: 660 }, // 10:00-11:00 booked
      ],
    });

    const slots = generateSlots(input);

    // 09:00-10:00: slot end (600) vs buffered booking start (600-15=585)
    // rangesOverlap(540, 600, 585, 675) => 540 < 675 && 585 < 600 => true
    // So 09:00 slot is UNAVAILABLE due to buffer
    expect(slots.find((s) => s.startMin === 540)?.available).toBe(false);

    // 10:00-11:00 — unavailable (overlaps directly)
    expect(slots.find((s) => s.startMin === 600)?.available).toBe(false);

    // 11:00-12:00: slot start (660) vs buffered booking end (660+15=675)
    // rangesOverlap(660, 720, 585, 675) => 660 < 675 && 585 < 720 => true
    // So 11:00 slot is UNAVAILABLE due to buffer
    expect(slots.find((s) => s.startMin === 660)?.available).toBe(false);

    // 12:00-13:00 — available (far enough from buffered zone)
    expect(slots.find((s) => s.startMin === 720)?.available).toBe(true);
  });

  it('buffer of 0 means adjacent slots are available', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '12:00',
      durationMin: 60,
      slotInterval: 60,
      bufferMinutes: 0,
      existingBookings: [
        { startMin: 600, endMin: 660 }, // 10:00-11:00 booked
      ],
    });

    const slots = generateSlots(input);

    // Adjacent slots should be available with 0 buffer
    expect(slots.find((s) => s.startMin === 540)?.available).toBe(true);  // 09:00
    expect(slots.find((s) => s.startMin === 600)?.available).toBe(false); // 10:00
    expect(slots.find((s) => s.startMin === 660)?.available).toBe(true);  // 11:00
  });

  // ---- Edge cases ----

  it('handles 15-minute slot intervals with 30-minute services', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '10:00',
      durationMin: 30,
      slotInterval: 15,
    });

    const slots = generateSlots(input);

    // 09:00-09:30, 09:15-09:45, 09:30-10:00 = 3 slots
    // 09:45-10:15 exceeds workEnd
    expect(slots).toHaveLength(3);
    expect(slots[0]).toEqual({ startMin: 540, endMin: 570, available: true });
    expect(slots[1]).toEqual({ startMin: 555, endMin: 585, available: true });
    expect(slots[2]).toEqual({ startMin: 570, endMin: 600, available: true });
  });

  it('handles a fully booked day', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '12:00',
      durationMin: 60,
      slotInterval: 60,
      existingBookings: [
        { startMin: 540, endMin: 600 },
        { startMin: 600, endMin: 660 },
        { startMin: 660, endMin: 720 },
      ],
    });

    const slots = generateSlots(input);
    expect(slots.every((s) => !s.available)).toBe(true);
  });

  it('handles a day with no working hours (empty window)', () => {
    const input = makeInput({
      workStart: '09:00',
      workEnd: '09:00',
      durationMin: 60,
      slotInterval: 30,
    });

    const slots = generateSlots(input);
    expect(slots).toHaveLength(0);
  });
});

// ============================================================================
// localToUtcIso — timezone conversion
// ============================================================================

describe('localToUtcIso', () => {
  it('converts Jerusalem local time to UTC (UTC+2 in winter / UTC+3 in summer)', () => {
    // 2025-01-15 09:00 in Asia/Jerusalem (IST, UTC+2) => 07:00 UTC
    const result = localToUtcIso('2025-01-15', '09:00', 'Asia/Jerusalem');
    const date = new Date(result);

    expect(date.getUTCHours()).toBe(7);
    expect(date.getUTCMinutes()).toBe(0);
  });

  it('converts UTC timezone correctly (no offset)', () => {
    const result = localToUtcIso('2025-06-15', '12:00', 'UTC');
    const date = new Date(result);

    expect(date.getUTCHours()).toBe(12);
    expect(date.getUTCMinutes()).toBe(0);
  });

  it('returns a valid ISO-8601 string', () => {
    const result = localToUtcIso('2025-03-20', '14:30', 'Europe/Moscow');

    // Should be parseable
    const date = new Date(result);
    expect(date.toString()).not.toBe('Invalid Date');

    // Should end with Z or have timezone info
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('handles midnight correctly', () => {
    const result = localToUtcIso('2025-06-01', '00:00', 'Asia/Jerusalem');
    const date = new Date(result);

    // Midnight in Jerusalem (UTC+3 summer) = 21:00 previous day UTC
    expect(date.getUTCHours()).toBe(21);
    expect(date.getUTCDate()).toBe(31); // May 31
  });
});
