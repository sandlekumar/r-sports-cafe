const mongoose = require('mongoose');
const { BOOKING_STATUS, BOOKING_SOURCE } = require('../constants');

/**
 * TABLE_BOOKINGS
 * The core reservation record.
 * 
 * IMPORTANT — Double Booking Prevention:
 * This collection alone does NOT guarantee conflict-free bookings.
 * Conflict-safe reservations are enforced via the BookingSlotLock collection.
 * See server/models/BookingSlotLock.js for the atomic locking mechanism.
 */
const tableBookingSchema = new mongoose.Schema(
  {
    // Human-readable reference (e.g. RSC-2026-00001)
    bookingNumber: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    bookingDate: {
      type: String, // YYYY-MM-DD — stored as string to avoid timezone drift
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String, // HH:MM 24-hour
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // HH:MM 24-hour — computed from startTime + duration
      required: [true, 'End time is required'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'Guest count must be at least 1'],
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantArea',
      required: [true, 'Area is required'],
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantTable',
      required: [true, 'Table is required'],
    },
    occasion: {
      type: String,
      enum: ['casual_dining', 'birthday', 'anniversary', 'business_meeting', 'date', 'other'],
      default: 'casual_dining',
    },
    specialRequest: {
      type: String,
      maxlength: [500, 'Special request cannot exceed 500 characters'],
    },
    source: {
      type: String,
      enum: Object.values(BOOKING_SOURCE),
      default: BOOKING_SOURCE.WEBSITE,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    // Admin-only field
    adminNotes: {
      type: String,
      select: false,
    },
    // Tracks which admin last touched this booking
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    // Cancellation tracking
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate booking number before save
tableBookingSchema.pre('save', async function () {
  if (!this.bookingNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('TableBooking').countDocuments();
    this.bookingNumber = `RSC-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

// Indexes for common query patterns
tableBookingSchema.index({ bookingDate: 1, status: 1 });
tableBookingSchema.index({ table: 1, bookingDate: 1, status: 1 });
tableBookingSchema.index({ customer: 1, createdAt: -1 });
tableBookingSchema.index({ status: 1, bookingDate: 1, startTime: 1 });

module.exports = mongoose.model('TableBooking', tableBookingSchema);
