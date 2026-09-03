/**
 * AvailabilityService
 *
 * The core booking engine. Determines which tables are available
 * for a given date, time, guest count, and optional area.
 *
 * Checks (in order):
 *  1. Settings: is the date/time within booking rules?
 *  2. BusinessHours: is the restaurant open at the requested time?
 *  3. BlockedDates: is the entire date (or area) blocked?
 *  4. BlockedTimeSlots: is the specific time window blocked?
 *  5. Tables: filter by area, capacity (min/max), bookable, active
 *  6. BookingSlotLocks: which tables have existing slot locks that overlap?
 *  7. Return only truly available tables
 */

const mongoose = require('mongoose');
const RestaurantArea = require('../models/RestaurantArea');
const RestaurantTable = require('../models/RestaurantTable');
const BookingSlotLock = require('../models/BookingSlotLock');
const BusinessHours = require('../models/BusinessHours');
const BlockedDate = require('../models/BlockedDate');
const BlockedTimeSlot = require('../models/BlockedTimeSlot');
const Settings = require('../models/Settings');
const {
  timeToMinutes,
  computeEndTime,
  generateSlots,
  timesOverlap,
} = require('../utils/timeSlots');

// ─── Named error codes ────────────────────────────────────────────────────────
const AvailabilityError = {
  RESTAURANT_CLOSED: 'RESTAURANT_CLOSED',
  DATE_BLOCKED: 'DATE_BLOCKED',
  TIME_BLOCKED: 'TIME_BLOCKED',
  OUTSIDE_BOOKING_WINDOW: 'OUTSIDE_BOOKING_WINDOW',
  TOO_SOON: 'TOO_SOON',
  INVALID_DATE: 'INVALID_DATE',
  NO_TABLES: 'NO_TABLES',
};

/**
 * Main availability check function.
 *
 * @param {Object} params
 * @param {string} params.date      - YYYY-MM-DD
 * @param {string} params.time      - HH:MM (24-hour)
 * @param {number} params.guests    - number of guests
 * @param {string} [params.areaId]  - optional ObjectId string to filter by area
 * @returns {Object} { availableAreas, availableTables, settings, endTime, durationMinutes }
 * @throws  Error with .code from AvailabilityError if not bookable
 */
const checkAvailability = async ({ date, time, guests, areaId }) => {
  // ─── 1. Load settings ────────────────────────────────────────────────────────
  const settings = await Settings.getSettings();
  const {
    bookingIntervalMinutes,
    defaultDurationMinutes,
    bufferMinutes,
    minAdvanceBookingMinutes,
    maxAdvanceBookingDays,
    maxGuestsPerOnlineBooking,
  } = settings;

  // ─── 2. Validate date is within advance booking window ───────────────────────
  const requestedDateTime = new Date(`${date}T${time}:00`);
  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxAdvanceBookingDays);

  if (requestedDateTime < new Date(now.getTime() + minAdvanceBookingMinutes * 60000)) {
    const err = new Error(`Bookings must be made at least ${minAdvanceBookingMinutes} minutes in advance`);
    err.code = AvailabilityError.TOO_SOON;
    err.statusCode = 422;
    throw err;
  }

  if (requestedDateTime > maxDate) {
    const err = new Error(`Bookings cannot be made more than ${maxAdvanceBookingDays} days in advance`);
    err.code = AvailabilityError.OUTSIDE_BOOKING_WINDOW;
    err.statusCode = 422;
    throw err;
  }

  // ─── 3. Check business hours ─────────────────────────────────────────────────
  const dayOfWeek = requestedDateTime.getDay(); // 0=Sun..6=Sat
  const businessHours = await BusinessHours.findOne({ dayOfWeek });

  if (!businessHours || !businessHours.isOpen) {
    const err = new Error('The restaurant is closed on the selected day');
    err.code = AvailabilityError.RESTAURANT_CLOSED;
    err.statusCode = 422;
    throw err;
  }

  const endTime = computeEndTime(time, defaultDurationMinutes);
  const openMins = timeToMinutes(businessHours.openTime);
  const closeMins = timeToMinutes(businessHours.closeTime);
  const startMins = timeToMinutes(time);
  const endMins = timeToMinutes(endTime);

  if (startMins < openMins || endMins > closeMins) {
    const err = new Error(
      `Booking window ${time}–${endTime} is outside opening hours ${businessHours.openTime}–${businessHours.closeTime}`
    );
    err.code = AvailabilityError.RESTAURANT_CLOSED;
    err.statusCode = 422;
    throw err;
  }

  // ─── 4. Check blocked dates ──────────────────────────────────────────────────
  const blockedDateQuery = {
    date,
    $or: [
      { area: null, table: null },                              // Whole restaurant blocked
      ...(areaId ? [{ area: new mongoose.Types.ObjectId(areaId), table: null }] : []), // Area blocked
    ],
  };
  const blockedDate = await BlockedDate.findOne(blockedDateQuery);
  if (blockedDate) {
    const err = new Error(`${date} is not available for bookings: ${blockedDate.reason || 'Closed'}`);
    err.code = AvailabilityError.DATE_BLOCKED;
    err.statusCode = 422;
    throw err;
  }

  // ─── 5. Check blocked time slots ─────────────────────────────────────────────
  const blockedSlots = await BlockedTimeSlot.find({
    date,
    type: 'BLOCKED',
    ...(areaId ? { $or: [{ area: null }, { area: new mongoose.Types.ObjectId(areaId) }] } : { area: null }),
  });

  for (const block of blockedSlots) {
    if (timesOverlap(time, endTime, block.startTime, block.endTime)) {
      const err = new Error(
        `The time ${time}–${endTime} is blocked: ${block.reason || 'Unavailable'}`
      );
      err.code = AvailabilityError.TIME_BLOCKED;
      err.statusCode = 422;
      throw err;
    }
  }

  // ─── 6. Find candidate tables ────────────────────────────────────────────────
  const tableQuery = {
    bookable: true,
    active: true,
    minimumCapacity: { $lte: guests },
    $or: [
      { maximumCapacity: { $gte: guests } },
      { maximumCapacity: null, capacity: { $gte: guests } },
    ],
  };

  if (areaId) {
    tableQuery.area = new mongoose.Types.ObjectId(areaId);
  }

  const candidateTables = await RestaurantTable.find(tableQuery).populate('area');

  if (candidateTables.length === 0) {
    const err = new Error('No tables found matching your guest count and area selection');
    err.code = AvailabilityError.NO_TABLES;
    err.statusCode = 422;
    throw err;
  }

  // ─── 7. Check per-table blocked dates ────────────────────────────────────────
  const tableBlockedDates = await BlockedDate.find({
    date,
    table: { $in: candidateTables.map((t) => t._id) },
  });
  const tableBlockedIds = new Set(tableBlockedDates.map((b) => b.table.toString()));

  // ─── 8. Generate required slots for the booking period ───────────────────────
  const requiredSlots = generateSlots(time, defaultDurationMinutes, bookingIntervalMinutes, bufferMinutes);

  // ─── 9. Find occupied slots for candidate tables on this date ────────────────
  const occupiedLocks = await BookingSlotLock.find({
    bookingDate: date,
    table: { $in: candidateTables.map((t) => t._id) },
    slotStart: { $in: requiredSlots },
  });

  // Build a set: "tableId|slotStart" for O(1) lookup
  const occupiedSet = new Set(
    occupiedLocks.map((lock) => `${lock.table.toString()}|${lock.slotStart}`)
  );

  // ─── 10. Filter available tables ─────────────────────────────────────────────
  const availableTables = candidateTables.filter((table) => {
    // Skip if table is individually blocked on this date
    if (tableBlockedIds.has(table._id.toString())) return false;

    // Skip if any required slot is occupied
    const isOccupied = requiredSlots.some((slot) =>
      occupiedSet.has(`${table._id.toString()}|${slot}`)
    );
    return !isOccupied;
  });

  // ─── 11. Gather distinct available areas ─────────────────────────────────────
  const availableAreaMap = new Map();
  for (const table of availableTables) {
    if (table.area && !availableAreaMap.has(table.area._id.toString())) {
      availableAreaMap.set(table.area._id.toString(), table.area);
    }
  }

  return {
    date,
    time,
    endTime,
    durationMinutes: defaultDurationMinutes,
    guests,
    bookingIntervalMinutes,
    availableAreas: Array.from(availableAreaMap.values()),
    availableTables: availableTables.map((t) => ({
      _id: t._id,
      name: t.name,
      area: t.area,
      capacity: t.capacity,
      minimumCapacity: t.minimumCapacity,
      maximumCapacity: t.maximumCapacity,
      shape: t.shape,
      positionX: t.positionX,
      positionY: t.positionY,
    })),
  };
};

/**
 * Assign the "best" available table automatically.
 * Prefers the table with the smallest capacity >= guest count (least wasteful).
 */
const assignBestTable = (availableTables, guests) => {
  const suitable = availableTables
    .filter((t) => t.capacity >= guests)
    .sort((a, b) => a.capacity - b.capacity);
  return suitable[0] || null;
};

module.exports = { checkAvailability, assignBestTable, AvailabilityError };
