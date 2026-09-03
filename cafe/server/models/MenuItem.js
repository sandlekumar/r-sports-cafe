const mongoose = require('mongoose');

/**
 * MENU ITEM
 * Admin-managed public menu cards displayed on the website.
 * Supports static fallback photo + optional trending 2-4s video motion loop.
 */
const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'SIGNATURE BURGER',
    },
    desc: {
      type: String,
      trim: true,
      maxlength: [600, 'Description cannot exceed 600 characters'],
    },
    price: {
      type: String,
      required: [true, 'Price is required'],
      trim: true,
    },
    // Static photo / poster frame URL fallback
    photo: {
      type: String,
      default: null,
    },
    // Trending 2-4s video loop URL (MP4 / WebM)
    video_loop_url: {
      type: String,
      default: null,
    },
    // Reuses exact is_trending pattern from Events
    is_trending: {
      type: Boolean,
      default: false,
    },
    trending_score: {
      type: Number,
      default: 0,
    },
    accent: {
      type: String,
      default: '#C8956C',
    },
    status: {
      type: String,
      enum: ['active', 'draft'],
      default: 'active',
    },
    display_order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

menuItemSchema.index({ status: 1, display_order: 1 });
menuItemSchema.index({ is_trending: 1, trending_score: -1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
