const mongoose = require('mongoose');

/**
 * CONTACT_ENQUIRIES
 * General contact form submissions from the website.
 * Admin can view, respond to, and mark as resolved.
 */
const contactEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'RESOLVED'],
      default: 'NEW',
    },
    // Spam prevention — track submission IP (hashed for privacy)
    ipHash: {
      type: String,
      select: false,
    },
    resolvedAt: {
      type: Date,
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  {
    timestamps: true,
  }
);

contactEnquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactEnquiry', contactEnquirySchema);
