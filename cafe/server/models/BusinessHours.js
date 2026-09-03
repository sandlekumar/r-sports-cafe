const mongoose = require('mongoose');

/**
 * BUSINESS_HOURS
 * Configures the restaurant's opening/closing times per day of week.
 * dayOfWeek: 0=Sunday, 1=Monday, ..., 6=Saturday
 * Also controls booking availability window settings.
 */
const businessHoursSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
      unique: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openTime: {
      type: String, // HH:MM 24-hour e.g. "11:00"
      required: function () { return this.isOpen; },
    },
    closeTime: {
      type: String, // HH:MM 24-hour e.g. "23:30"
      required: function () { return this.isOpen; },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BusinessHours', businessHoursSchema);
