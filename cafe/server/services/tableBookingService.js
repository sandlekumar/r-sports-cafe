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

const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const TableBooking = require('../models/TableBooking');
const BookingSlotLock = require('../models/BookingSlotLock');
const BookingHistory = require('../models/BookingHistory');
const Settings = require('../models/Settings');
const { checkAvailability } = require('./availabilityService');
const { generateSlots, computeEndTime } = require('../utils/timeSlots');
const { BOOKING_STATUS, BOOKING_SOURCE } = require('../constants');
const { sendBookingConfirmation, sendAdminBookingNotification } = require('../utils/emailService');

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

  // ─── 4b. Generate cancellation token ──────────────────────────────────────
  const cancellationToken = crypto.randomBytes(16).toString('hex');

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
            cancellationToken,
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
          cancellationToken,
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

    // Fire-and-forget confirmation email — never awaited in a way that delays the response
    sendBookingConfirmation({
      email: customer.email,
      name: customer.name,
      bookingNumber: booking.bookingNumber,
      date,
      time,
      guests,
      cancellationToken,
    });
    
    // Admin notification email
    sendAdminBookingNotification({
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      bookingNumber: booking.bookingNumber,
      date,
      time,
      guests,
      specialRequest,
    });

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

/**
 * Cancel a table booking via the customer's email link.
 * Validates the cancellation token, flips status, frees slot locks,
 * and records an audit trail entry.
 *
 * @param {string} bookingNumber - e.g. RSC-2026-00001
 * @param {string} token         - the 32-char hex cancellation token
 * @param {string} [reason]      - optional reason from the customer
 * @returns {Object} the updated booking
 */
const cancelTableBooking = async (bookingNumber, token, reason) => {
  const booking = await TableBooking.findOne({ bookingNumber }).select('+cancellationToken');

  if (!booking || !booking.cancellationToken) {
    const err = new Error('Invalid cancellation link');
    err.statusCode = 404;
    err.code = 'INVALID_CANCEL_LINK';
    throw err;
  }

  // Timing-safe token comparison to prevent timing attacks
  const tokenBuf = Buffer.from(token || '', 'utf8');
  const storedBuf = Buffer.from(booking.cancellationToken, 'utf8');
  if (tokenBuf.length !== storedBuf.length || !crypto.timingSafeEqual(tokenBuf, storedBuf)) {
    const err = new Error('Invalid cancellation link');
    err.statusCode = 404;
    err.code = 'INVALID_CANCEL_LINK';
    throw err;
  }

  // Idempotent — already cancelled
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    return booking;
  }

  const oldStatus = booking.status;
  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason || 'Cancelled by customer';
  await booking.save();

  // Free the table slot locks so the time becomes bookable again
  await BookingSlotLock.deleteMany({ booking: booking._id });

  // Audit trail
  await BookingHistory.create({
    booking: booking._id,
    action: 'CANCELLED',
    previousValue: { status: oldStatus },
    newValue: { status: BOOKING_STATUS.CANCELLED },
    note: reason
      ? `Cancelled by customer via email link: ${reason}`
      : 'Cancelled by customer via email link',
  });

  return booking;
};

module.exports = { createTableBooking, cancelTableBooking };
