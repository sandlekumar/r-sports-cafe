/**
 * TableBookingService
 * Handles the creation of a table booking atomically:
 *   1. Find or create Customer
 *   2. Open MongoDB Transaction
 *   3. Create TableBooking record
 *   4. Generate slot array and insert BookingSlotLock documents
 *   5. If ANY slot is already taken (E11000), rollback → "table no longer available"
 *   6. Create BookingHistory audit record
 *   7. Commit and return booking number
 */

const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const TableBooking = require('../models/TableBooking');
const BookingSlotLock = require('../models/BookingSlotLock');
const BookingHistory = require('../models/BookingHistory');
const Settings = require('../models/Settings');
const { checkAvailability } = require('./availabilityService');
const { generateSlots, computeEndTime } = require('../utils/timeSlots');
const { BOOKING_STATUS, BOOKING_SOURCE } = require('../constants');

/**
 * Create a new table booking atomically.
 *
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.phone
 * @param {string} [data.whatsapp]
 * @param {string} [data.email]
 * @param {string} data.date        - YYYY-MM-DD
 * @param {string} data.time        - HH:MM
 * @param {number} data.guests
 * @param {string} data.areaId
 * @param {string} [data.tableId]   - if null, auto-assign best table
 * @param {string} [data.occasion]
 * @param {string} [data.specialRequest]
 * @param {string} [data.source]    - defaults to WEBSITE
 * @returns {Object} { bookingNumber, bookingId, customer, endTime }
 */
const createTableBooking = async (data) => {
  const {
    name, phone, whatsapp, email,
    date, time, guests, areaId, tableId,
    occasion, specialRequest,
    source = BOOKING_SOURCE.WEBSITE,
  } = data;

  // ─── 1. Load settings ─────────────────────────────────────────────────────
  const settings = await Settings.getSettings();
  const { bookingIntervalMinutes, defaultDurationMinutes, bufferMinutes } = settings;
  const endTime = computeEndTime(time, defaultDurationMinutes);

  // ─── 2. Verify real-time availability (catches last-second conflicts) ──────
  const availability = await checkAvailability({ date, time, guests, areaId: (areaId && areaId !== '') ? areaId : undefined });

  // Determine which table to use
  let resolvedTableId = tableId;
  let resolvedTable = null;
  if (!resolvedTableId) {
    const { assignBestTable } = require('./availabilityService');
    resolvedTable = assignBestTable(availability.availableTables, guests);
    if (!resolvedTable) {
      const err = new Error('No suitable table available for auto-assignment');
      err.code = 'NO_TABLES';
      err.statusCode = 422;
      throw err;
    }
    resolvedTableId = resolvedTable._id;
  } else {
    // Verify the chosen table is in the available list
    resolvedTable = availability.availableTables.find(
      (t) => t._id.toString() === resolvedTableId.toString()
    );
    if (!resolvedTable) {
      const err = new Error('That table is no longer available. Please select another table.');
      err.code = 'TABLE_NOT_AVAILABLE';
      err.statusCode = 409;
      throw err;
    }
  }

  const resolvedAreaId = (areaId && areaId !== '') ? areaId : (resolvedTable.area?._id || resolvedTable.area);

  // ─── 3. Find or create Customer ───────────────────────────────────────────
  let customer = await Customer.findOne({ phone });
  if (!customer) {
    customer = await Customer.create({ name, phone, whatsapp, email });
  } else {
    // Update name/email if provided and different
    let changed = false;
    if (name && customer.name !== name) { customer.name = name; changed = true; }
    if (email && customer.email !== email) { customer.email = email; changed = true; }
    if (whatsapp && customer.whatsapp !== whatsapp) { customer.whatsapp = whatsapp; changed = true; }
    if (changed) await customer.save();
  }

  // ─── 4. Generate slot locks required for this booking ────────────────────
  const requiredSlots = generateSlots(time, defaultDurationMinutes, bookingIntervalMinutes, bufferMinutes);

  // ─── 5. Open MongoDB Transaction ──────────────────────────────────────────
  const session = await mongoose.startSession();
  let booking;

  try {
    try {
      await session.withTransaction(async () => {
        // Create the booking record
        [booking] = await TableBooking.create(
          [{
            customer: customer._id,
            bookingDate: date,
            startTime: time,
            endTime,
            durationMinutes: defaultDurationMinutes,
            guestCount: guests,
            area: resolvedAreaId,
            table: resolvedTableId,
            occasion: occasion || 'casual_dining',
            specialRequest,
            source,
            status: BOOKING_STATUS.PENDING,
          }],
          { session }
        );

        // Atomically insert all slot locks
        // If any slot already exists, MongoDB throws E11000 and the entire
        // transaction rolls back — preventing double booking.
        await BookingSlotLock.insertMany(
          requiredSlots.map((slotStart) => ({
            table: resolvedTableId,
            booking: booking._id,
            bookingDate: date,
            slotStart,
          })),
          { session, ordered: true }
        );

        // Append audit history
        await BookingHistory.create(
          [{
            booking: booking._id,
            action: 'CREATED',
            newValue: { status: BOOKING_STATUS.PENDING, date, time, guests },
            note: `Booking created via ${source}`,
          }],
          { session }
        );
      });
    } catch (txErr) {
      // Standalone MongoDB fallback (when replica set is not configured in local dev)
      if (txErr.message && txErr.message.includes('Transaction numbers are only allowed')) {
        [booking] = await TableBooking.create([{
          customer: customer._id,
          bookingDate: date,
          startTime: time,
          endTime,
          durationMinutes: defaultDurationMinutes,
          guestCount: guests,
          area: resolvedAreaId,
          table: resolvedTableId,
          occasion: occasion || 'casual_dining',
          specialRequest,
          source,
          status: BOOKING_STATUS.PENDING,
        }]);

        await BookingSlotLock.insertMany(
          requiredSlots.map((slotStart) => ({
            table: resolvedTableId,
            booking: booking._id,
            bookingDate: date,
            slotStart,
          })),
          { ordered: true }
        );

        await BookingHistory.create([{
          booking: booking._id,
          action: 'CREATED',
          newValue: { status: BOOKING_STATUS.PENDING, date, time, guests },
          note: `Booking created via ${source}`,
        }]);
      } else {
        throw txErr;
      }
    }

    // Increment customer booking count (outside transaction is fine — best-effort)
    await Customer.findByIdAndUpdate(customer._id, { $inc: { totalBookings: 1 } });

    return {
      bookingNumber: booking.bookingNumber,
      bookingId: booking._id,
      customer: { name: customer.name, phone: customer.phone, email: customer.email },
      date,
      time,
      endTime,
      durationMinutes: defaultDurationMinutes,
      guests,
    };
  } catch (err) {
    // MongoDB duplicate key = slot already taken (race condition caught!)
    if (err.code === 11000 || (err.writeErrors && err.writeErrors.some((e) => e.code === 11000))) {
      const conflict = new Error('That table is no longer available. Please select another table.');
      conflict.code = 'TABLE_CONFLICT';
      conflict.statusCode = 409;
      throw conflict;
    }
    throw err;
  } finally {
    session.endSession();
  }
};

module.exports = { createTableBooking };
