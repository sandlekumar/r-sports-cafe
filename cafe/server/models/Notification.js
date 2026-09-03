const mongoose = require('mongoose');

/**
 * NOTIFICATIONS
 * Internal notification records for admin dashboard.
 * Designed with clean adapters for future WhatsApp/SMS/Email channels.
 */
const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'BOOKING_CREATED',
        'BOOKING_CONFIRMED',
        'BOOKING_RESCHEDULED',
        'BOOKING_CANCELLED',
        'BOOKING_REMINDER',
        'EVENT_ENQUIRY_RECEIVED',
        'WALK_IN_SEATED',
      ],
    },
    // The target entity (booking, event, etc.)
    refModel: {
      type: String,
      enum: ['TableBooking', 'EventBooking', 'ContactEnquiry'],
    },
    ref: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // Customer to notify
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    message: {
      type: String,
    },
    // Channel tracking (for future multi-channel support)
    channels: {
      whatsapp: { sent: { type: Boolean, default: false }, sentAt: Date },
      sms: { sent: { type: Boolean, default: false }, sentAt: Date },
      email: { sent: { type: Boolean, default: false }, sentAt: Date },
      internal: { sent: { type: Boolean, default: false }, sentAt: Date },
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ ref: 1, refModel: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
