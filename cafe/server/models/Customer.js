const mongoose = require('mongoose');

/**
 * CUSTOMERS
 * People who make bookings via the website, phone, or walk-in.
 * Internal notes are never exposed to the customer.
 */
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    // Admin-only — never sent to customer
    internalNotes: {
      type: String,
      select: false,
    },
    // Computed fields updated on booking events
    totalBookings: {
      type: Number,
      default: 0,
    },
    cancellationCount: {
      type: Number,
      default: 0,
    },
    noShowCount: {
      type: Number,
      default: 0,
    },
    lastVisit: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 }, { sparse: true });
customerSchema.index({ name: 'text', phone: 'text', email: 'text' }); // Full-text search

module.exports = mongoose.model('Customer', customerSchema);
