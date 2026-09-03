/**
 * Integration-style tests for the AvailabilityService.
 * We mock MongoDB models so no live DB is required.
 *
 * Tests the 8 scenarios from the spec:
 *  1. Normal booking — tables returned
 *  2. Overlapping booking — conflicting table excluded
 *  3. Boundary time — booking starts exactly when another ends (allowed)
 *  4. Blocked table — excluded even if slot is free
 *  5. Blocked date — entire date blocked → error
 *  6. Table capacity mismatch — no matching tables → error
 *  7. Disabled table — inactive tables never returned
 *  8. Multiple areas — tables from multiple areas returned correctly
 */

// ─── Mock all Mongoose models ─────────────────────────────────────────────────
jest.mock('../../models/Settings', () => ({ getSettings: jest.fn() }));
jest.mock('../../models/BusinessHours', () => ({ findOne: jest.fn() }));
jest.mock('../../models/BlockedDate', () => ({ findOne: jest.fn(), find: jest.fn() }));
jest.mock('../../models/BlockedTimeSlot', () => ({ find: jest.fn() }));
jest.mock('../../models/BookingSlotLock', () => ({ find: jest.fn() }));
jest.mock('../../models/RestaurantArea');

// RestaurantTable mock: find() must return a chainable object with .populate()
// We use a module-level holder so each test can control the resolved value.
const mockTableResults = { value: [] };
jest.mock('../../models/RestaurantTable', () => ({
  find: jest.fn(() => ({
    populate: jest.fn(() => Promise.resolve(mockTableResults.value)),
  })),
}));

// Lightweight ObjectId mock — just wraps a string
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    Types: {
      ObjectId: class {
        constructor(v) { this._id = v; }
        toString() { return this._id; }
      },
    },
  };
});

const Settings = require('../../models/Settings');
const BusinessHours = require('../../models/BusinessHours');
const BlockedDate = require('../../models/BlockedDate');
const BlockedTimeSlot = require('../../models/BlockedTimeSlot');
const BookingSlotLock = require('../../models/BookingSlotLock');
const RestaurantTable = require('../../models/RestaurantTable');
const { checkAvailability } = require('../../services/availabilityService');

// ─── Shared fixtures ──────────────────────────────────────────────────────────
const defaultSettings = {
  bookingIntervalMinutes: 30,
  defaultDurationMinutes: 90,
  bufferMinutes: 0,
  minAdvanceBookingMinutes: 0, // Disabled for tests
  maxAdvanceBookingDays: 365,
  maxGuestsPerOnlineBooking: 20,
};
const openHours = { isOpen: true, openTime: '11:00', closeTime: '23:30' };

// Far-future date so advance booking window checks don't interfere
const FUTURE_DATE = '2027-06-15';

const makeTable = (id, capacity, areaId = 'area1') => ({
  _id: { toString: () => id },
  name: `Table-${id}`,
  capacity,
  minimumCapacity: 1,
  maximumCapacity: capacity,
  area: { _id: { toString: () => areaId }, name: `Area-${areaId}`, displayOrder: 0 },
  shape: 'square',
  positionX: 0,
  positionY: 0,
});

// Helper to set which tables the DB "returns" for a test
const setTables = (tables) => {
  mockTableResults.value = tables;
  // Refresh the mock so the new populate chain resolves correctly
  RestaurantTable.find.mockReturnValue({
    populate: jest.fn(() => Promise.resolve(tables)),
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockTableResults.value = [];
  Settings.getSettings.mockResolvedValue(defaultSettings);
  BusinessHours.findOne.mockResolvedValue(openHours);
  BlockedDate.findOne.mockResolvedValue(null);
  BlockedDate.find.mockResolvedValue([]);
  BlockedTimeSlot.find.mockResolvedValue([]);
  BookingSlotLock.find.mockResolvedValue([]);
});

// ─── TEST 1: Normal booking — returns available tables ────────────────────────
test('1. Normal booking returns available tables', async () => {
  setTables([makeTable('t1', 4), makeTable('t2', 6)]);

  const result = await checkAvailability({ date: FUTURE_DATE, time: '19:00', guests: 4 });

  expect(result.availableTables).toHaveLength(2);
  expect(result.endTime).toBe('20:30');
  expect(result.durationMinutes).toBe(90);
});

// ─── TEST 2: Overlapping booking — occupied table excluded ────────────────────
test('2. Table with an existing slot lock is excluded', async () => {
  setTables([makeTable('t1', 4), makeTable('t2', 4)]);

  // t1 has the 19:00 slot locked (an existing 19:00–20:30 booking)
  BookingSlotLock.find.mockResolvedValue([
    { table: { toString: () => 't1' }, slotStart: '19:00' },
  ]);

  const result = await checkAvailability({ date: FUTURE_DATE, time: '19:00', guests: 4 });

  expect(result.availableTables).toHaveLength(1);
  expect(result.availableTables[0]._id.toString()).toBe('t2');
});

// ─── TEST 3: Boundary time — booking at exact end of another is allowed ───────
test('3. Booking starting at exact endTime of prior booking is allowed', async () => {
  setTables([makeTable('t1', 4)]);

  // Prior booking: 17:00–18:30 occupies slots 17:00, 17:30, 18:00
  // Our request: 18:30 would need slots 18:30, 19:00, 19:30
  // BookingSlotLock returns nothing for our required slots → no conflict
  BookingSlotLock.find.mockResolvedValue([]);

  const result = await checkAvailability({ date: FUTURE_DATE, time: '18:30', guests: 4 });

  expect(result.availableTables).toHaveLength(1);
});

// ─── TEST 4: Blocked table — excluded even though slot is free ────────────────
test('4. Individually blocked table is excluded', async () => {
  setTables([makeTable('t1', 4), makeTable('t2', 4)]);

  // t1 is blocked on this date (e.g. physical maintenance)
  BlockedDate.find.mockResolvedValue([
    { table: { toString: () => 't1' } },
  ]);

  const result = await checkAvailability({ date: FUTURE_DATE, time: '19:00', guests: 4 });

  expect(result.availableTables).toHaveLength(1);
  expect(result.availableTables[0]._id.toString()).toBe('t2');
});

// ─── TEST 5: Blocked date — throws DATE_BLOCKED error ────────────────────────
test('5. Fully blocked date throws DATE_BLOCKED error', async () => {
  BlockedDate.findOne.mockResolvedValue({ date: FUTURE_DATE, reason: 'Private event' });

  await expect(
    checkAvailability({ date: FUTURE_DATE, time: '19:00', guests: 4 })
  ).rejects.toMatchObject({ code: 'DATE_BLOCKED' });
});

// ─── TEST 6: Capacity mismatch — no matching tables → error ──────────────────
test('6. No tables matching guest count throws NO_TABLES', async () => {
  setTables([]); // DB returns empty (filtered out by capacity query)

  await expect(
    checkAvailability({ date: FUTURE_DATE, time: '19:00', guests: 50 })
  ).rejects.toMatchObject({ code: 'NO_TABLES' });
});

// ─── TEST 7: Non-bookable / disabled table → error ───────────────────────────
test('7. No active bookable tables throws NO_TABLES', async () => {
  // The DB query includes bookable:true, active:true — so disabled tables
  // are never returned. An empty array simulates this.
  setTables([]);

  await expect(
    checkAvailability({ date: FUTURE_DATE, time: '19:00', guests: 2 })
  ).rejects.toMatchObject({ code: 'NO_TABLES' });
});

// ─── TEST 8: Multiple areas — all area tables returned ────────────────────────
test('8. Tables from multiple areas are all returned', async () => {
  setTables([
    makeTable('t1', 4, 'area1'),
    makeTable('t2', 4, 'area2'),
    makeTable('t3', 6, 'area2'),
  ]);

  const result = await checkAvailability({ date: FUTURE_DATE, time: '19:00', guests: 4 });

  expect(result.availableTables).toHaveLength(3);
  // Two distinct areas
  expect(result.availableAreas).toHaveLength(2);
});
