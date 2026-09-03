const mongoose = require('mongoose');

/**
 * SETTINGS
 * Restaurant-wide configurable booking settings.
 * Stored as a single singleton document.
 * Admin can change these through the dashboard without touching code.
 *
 * bookingIntervalMinutes:
 *   Controls the granularity of time slots AND the BookingSlotLock intervals.
 *   A 30-minute interval means a 90-min booking locks 3 slots: :00, :30, :00.
 */
const settingsSchema = new mongoose.Schema(
  {
    // Singleton key — only one settings document ever exists
    key: {
      type: String,
      default: 'global',
      unique: true,
    },
    // Booking slot intervals in minutes (e.g. 30)
    bookingIntervalMinutes: {
      type: Number,
      default: 30,
      min: [15, 'Interval must be at least 15 minutes'],
    },
    // Default booking duration in minutes
    defaultDurationMinutes: {
      type: Number,
      default: 90,
      min: [30, 'Minimum duration is 30 minutes'],
    },
    // Buffer between bookings in minutes (cleanliness buffer)
    bufferMinutes: {
      type: Number,
      default: 0,
    },
    // How many minutes before a booking customers can book
    minAdvanceBookingMinutes: {
      type: Number,
      default: 60, // 1 hour
    },
    // Maximum days in advance a booking can be made
    maxAdvanceBookingDays: {
      type: Number,
      default: 30,
    },
    // Maximum guests per online booking
    maxGuestsPerOnlineBooking: {
      type: Number,
      default: 20,
    },
    // Restaurant display name
    restaurantName: {
      type: String,
      default: 'R SPORTS & CAFE',
    },
    // Contact information for booking confirmations
    contactPhone: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Static helper to get the singleton settings document
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: 'global' });
  if (!settings) {
    settings = await this.create({ key: 'global' });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
