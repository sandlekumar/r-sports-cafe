const mongoose = require('mongoose');
const { EVENT_STATUS } = require('../constants');

/**
 * EVENT_BOOKINGS
 * Enquiries for events: birthdays, anniversaries, corporate events, etc.
 * These are managed through a pipeline (NEW → CONTACTED → QUOTE_SENT → CONFIRMED → COMPLETED).
 * NOT mixed with table reservation logic or availability engine.
 */
const eventBookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: [
        'general_booking',
        'special_booking',
        'birthday_party',
        'anniversary',
        'corporate_event',
        'workshop',
        'other',
      ],
    },
    eventDate: {
      type: String, // YYYY-MM-DD preferred by customer
      required: [true, 'Preferred event date is required'],
    },
    preferredTime: {
      type: String, // Free text e.g. "Evening, around 7 PM"
    },
    guestCount: {
      type: Number,
      required: [true, 'Approximate guest count is required'],
      min: [1, 'Guest count must be at least 1'],
    },
    finalGuestCount: {
      type: Number, // Confirmed by admin after discussion
    },
    foodRequirement: {
      type: String,
    },
    specialRequirements: {
      type: String,
      maxlength: [1000, 'Special requirements cannot exceed 1000 characters'],
    },
    message: {
      type: String,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.NEW,
    },
    // Admin fields
    adminNotes: {
      type: String,
      select: false,
    },
    agreedDate: {
      type: String, // Final confirmed date after negotiation
    },
    agreedTime: {
      type: String, // Final confirmed time after negotiation
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    contactedAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

eventBookingSchema.index({ status: 1, createdAt: -1 });
eventBookingSchema.index({ customer: 1 });
eventBookingSchema.index({ eventType: 1, status: 1 });

module.exports = mongoose.model('EventBooking', eventBookingSchema);
