const mongoose = require('mongoose');

/**
 * BLOCKED_TIME_SLOTS
 * A specific time range blocked on a specific date.
 * Can also represent special opening hours overrides.
 * 
 * Examples:
 *   - Block 6–8 PM on 20 August for a private event
 *   - Set special hours 12 PM – 1 AM for a festival day
 */
const blockedTimeSlotSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String, // HH:MM
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // HH:MM
      required: [true, 'End time is required'],
    },
    reason: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['BLOCKED', 'SPECIAL_HOURS'],
      default: 'BLOCKED',
    },
    // Optional scope — null means restaurant-wide
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantArea',
      default: null,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantTable',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  {
    timestamps: true,
  }
);

blockedTimeSlotSchema.index({ date: 1, area: 1 });
blockedTimeSlotSchema.index({ date: 1, table: 1 });

module.exports = mongoose.model('BlockedTimeSlot', blockedTimeSlotSchema);
