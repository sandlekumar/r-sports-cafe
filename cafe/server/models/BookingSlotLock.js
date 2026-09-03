const mongoose = require('mongoose');

/**
 * BOOKING_SLOT_LOCKS
 *
 * This is the critical mechanism for race-condition-safe table booking.
 *
 * Problem:
 *   Two concurrent requests can both pass an availability check simultaneously,
 *   then both insert a booking — causing a double-booking.
 *
 * Solution:
 *   When a table is booked for e.g. 7:00 PM – 8:30 PM (interval = 30 min),
 *   we atomically insert individual slot lock documents:
 *
 *     { tableId, date, slotStart: "19:00" }
 *     { tableId, date, slotStart: "19:30" }
 *     { tableId, date, slotStart: "20:00" }
 *
 *   A UNIQUE compound index on (table + bookingDate + slotStart) means
 *   MongoDB will reject a duplicate slot with a duplicate-key error (E11000),
 *   even under concurrent load.
 *
 *   All slot inserts for a booking happen inside a MongoDB Transaction.
 *   If ANY slot is already taken, the entire transaction rolls back,
 *   and the caller receives a clean "Table no longer available" error.
 *
 *   When a booking is cancelled or completed, the locks are deleted
 *   atomically in the same transaction.
 *
 * Interval:
 *   Determined by Settings.bookingIntervalMinutes (default 30 min).
 */
const bookingSlotLockSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantTable',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TableBooking',
      required: true,
    },
    bookingDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    slotStart: {
      type: String, // HH:MM (24-hour) — the start of each 30-minute slot
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/**
 * THE CRITICAL UNIQUE INDEX
 * Prevents two bookings from ever occupying the same slot for the same table.
 * This is enforced at the database level — not just the application layer.
 */
bookingSlotLockSchema.index(
  { table: 1, bookingDate: 1, slotStart: 1 },
  { unique: true, name: 'unique_table_slot' }
);

// For querying all locks belonging to a booking (e.g. on cancel)
bookingSlotLockSchema.index({ booking: 1 });

// For querying all occupied slots on a given date (availability engine)
bookingSlotLockSchema.index({ bookingDate: 1, table: 1 });

module.exports = mongoose.model('BookingSlotLock', bookingSlotLockSchema);
