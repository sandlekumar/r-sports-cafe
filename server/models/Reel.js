const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
    required: true, // Will point to uploaded video path
  },
  thumbnailUrl: {
    type: String, // Optional thumbnail path
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);
