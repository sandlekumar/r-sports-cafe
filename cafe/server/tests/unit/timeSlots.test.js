/**
 * Unit tests for time slot utility functions.
 * These are pure functions with no DB dependency.
 */

const {
  timeToMinutes,
  minutesToTime,
  addMinutes,
  generateSlots,
  timesOverlap,
  isWithinWindow,
  computeEndTime,
} = require('../../utils/timeSlots');

describe('timeToMinutes', () => {
  test('converts 00:00 to 0', () => expect(timeToMinutes('00:00')).toBe(0));
  test('converts 19:00 to 1140', () => expect(timeToMinutes('19:00')).toBe(1140));
  test('converts 23:59 to 1439', () => expect(timeToMinutes('23:59')).toBe(1439));
});

describe('minutesToTime', () => {
  test('converts 0 to 00:00', () => expect(minutesToTime(0)).toBe('00:00'));
  test('converts 1140 to 19:00', () => expect(minutesToTime(1140)).toBe('19:00'));
  test('converts 90 to 01:30', () => expect(minutesToTime(90)).toBe('01:30'));
});

describe('computeEndTime', () => {
  test('19:00 + 90 min = 20:30', () => expect(computeEndTime('19:00', 90)).toBe('20:30'));
  test('22:00 + 90 min = 23:30', () => expect(computeEndTime('22:00', 90)).toBe('23:30'));
});

describe('generateSlots (interval=30, no buffer)', () => {
  test('90-minute booking from 19:00 generates 3 slots', () => {
    const slots = generateSlots('19:00', 90, 30, 0);
    expect(slots).toEqual(['19:00', '19:30', '20:00']);
  });

  test('60-minute booking from 07:00 generates 2 slots', () => {
    const slots = generateSlots('07:00', 60, 30, 0);
    expect(slots).toEqual(['07:00', '07:30']);
  });

  test('includes buffer slots when bufferMinutes > 0', () => {
    // 60-min booking + 30-min buffer = 90 min → 3 slots
    const slots = generateSlots('19:00', 60, 30, 30);
    expect(slots).toEqual(['19:00', '19:30', '20:00']);
  });
});

describe('timesOverlap', () => {
  test('overlapping windows return true', () => {
    expect(timesOverlap('19:00', '20:30', '20:00', '21:30')).toBe(true);
  });
  test('non-overlapping windows return false', () => {
    expect(timesOverlap('19:00', '20:30', '20:30', '22:00')).toBe(false);
  });
  test('identical windows overlap', () => {
    expect(timesOverlap('19:00', '20:30', '19:00', '20:30')).toBe(true);
  });
  test('contained window overlaps', () => {
    expect(timesOverlap('18:00', '21:00', '19:00', '20:00')).toBe(true);
  });
  test('adjacent non-overlapping (boundary)', () => {
    expect(timesOverlap('18:00', '19:00', '19:00', '20:00')).toBe(false);
  });
});

describe('isWithinWindow', () => {
  test('time inside window returns true', () => {
    expect(isWithinWindow('19:30', '19:00', '20:30')).toBe(true);
  });
  test('time at start of window returns true', () => {
    expect(isWithinWindow('19:00', '19:00', '20:30')).toBe(true);
  });
  test('time at end of window returns false (exclusive end)', () => {
    expect(isWithinWindow('20:30', '19:00', '20:30')).toBe(false);
  });
  test('time before window returns false', () => {
    expect(isWithinWindow('18:00', '19:00', '20:30')).toBe(false);
  });
});
