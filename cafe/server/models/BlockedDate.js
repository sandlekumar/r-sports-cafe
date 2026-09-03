const mongoose = require('mongoose');

/**
 * BLOCKED_DATES
 * Full days blocked from any online reservations (holidays, private events, etc.)
 * Can optionally block only a specific area.
 */
const blockedDateSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Date is required'],
    },
    reason: {
      type: String,
      trim: true,
    },
    // Optionally restrict to specific area — null means entire restaurant
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantArea',
      default: null,
    },
    // Optionally restrict to specific table — null means all tables in area/restaurant
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

blockedDateSchema.index({ date: 1, area: 1, table: 1 });

module.exports = mongoose.model('BlockedDate', blockedDateSchema);
