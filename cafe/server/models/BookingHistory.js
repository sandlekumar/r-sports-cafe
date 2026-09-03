const mongoose = require('mongoose');

/**
 * BOOKING_HISTORY
 * Immutable audit trail of every significant change to a booking.
 * Records who changed what, from what value, to what value, and when.
 * Never deleted — used for admin reporting and dispute resolution.
 */
const bookingHistorySchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TableBooking',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATED',
        'CONFIRMED',
        'STATUS_CHANGED',
        'DATE_CHANGED',
        'TIME_CHANGED',
        'TABLE_CHANGED',
        'GUEST_COUNT_CHANGED',
        'ARRIVED',
        'SEATED',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
        'NOTE_ADDED',
      ],
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    performedByName: {
      type: String, // Snapshot in case admin is deleted later
    },
    note: {
      type: String, // Optional human-readable description
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // History is append-only
  }
);

bookingHistorySchema.index({ booking: 1, createdAt: -1 });

module.exports = mongoose.model('BookingHistory', bookingHistorySchema);
