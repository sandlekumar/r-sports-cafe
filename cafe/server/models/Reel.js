const mongoose = require('mongoose');

/**
 * REEL MODEL
 * Admin-managed Instagram-style video reels for the public showcase section.
 */
const reelSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: [true, 'Caption is required'],
      trim: true,
      maxlength: [300, 'Caption cannot exceed 300 characters'],
    },
    handle: {
      type: String,
      default: '@rsports.cafe',
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    tag: {
      type: String,
      default: 'HIGHLIGHTS',
      trim: true,
    },
    likes: {
      type: String,
      default: '1.2K',
    },
    comments: {
      type: String,
      default: '45',
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
  { timestamps: true }
);

reelSchema.index({ status: 1, display_order: 1 });

module.exports = mongoose.model('Reel', reelSchema);
