const mongoose = require('mongoose');

/**
 * EVENT
 * Admin-managed public-facing event cards displayed on the website.
 * NOT to be confused with EventBooking (customer enquiry pipeline).
 *
 * Lifecycle: Admin creates → publishes → customers see on public Events page.
 *
 * Categories:
 *   - weekly:     recurring weekly events (e.g. "Saturday Night Football")
 *   - tournament: competitive / bracket events
 *   - special:    one-off, non-recurring, non-tournament events
 *
 * For weekly events, `recurrenceDay` stores the day name (e.g. "Saturday")
 * and `date` is auto-computed to the next occurrence on read.
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [600, 'Description cannot exceed 600 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['weekly', 'tournament', 'special'],
      default: 'special',
    },
    sportType: {
      type: String,
      trim: true,
      maxlength: [60, 'Sport type cannot exceed 60 characters'],
      default: '',
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Event date is required'],
    },
    time: {
      type: String, // e.g. "7:00 PM"
    },
    // For category === 'weekly': which day it recurs on
    recurrenceDay: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', ''],
      default: '',
    },
    // Photo URL — relative path stored, served as static file via Express
    photo: {
      type: String, // e.g. "/uploads/events/filename.jpg"
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    capacity: {
      type: Number,
      default: null,
    },
    spotsLeft: {
      type: Number,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    cta_label: {
      type: String,
      default: 'Book Now',
      maxlength: [40, 'CTA label cannot exceed 40 characters'],
    },
    cta_link: {
      type: String,
      default: '#booking',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled', 'draft'],
      default: 'upcoming',
    },
    // Powers the carousel — pinned to front
    is_featured: {
      type: Boolean,
      default: false,
    },
    // Powers the "Trending" tag on cards
    is_trending: {
      type: Boolean,
      default: false,
    },
    // Optional ranking score within trending (higher = shown first)
    trending_score: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Display order override
    display_order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ is_featured: 1 });
eventSchema.index({ is_trending: 1, trending_score: -1 });

module.exports = mongoose.model('Event', eventSchema);
