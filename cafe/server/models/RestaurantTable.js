const mongoose = require('mongoose');

/**
 * RESTAURANT_TABLES
 * Individual tables within an area.
 * Stores layout position data for the visual floor-plan editor (Step 9).
 * Admin can manage all properties without editing code.
 */
const restaurantTableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Table name is required'],
      trim: true,
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantArea',
      required: [true, 'Area is required'],
    },
    // Capacity
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    minimumCapacity: {
      type: Number,
      default: 1,
      min: [1, 'Minimum capacity must be at least 1'],
    },
    maximumCapacity: {
      type: Number,
    },
    // Floor plan layout (Step 9 — drag & drop editor)
    positionX: { type: Number, default: 0 },
    positionY: { type: Number, default: 0 },
    width: { type: Number, default: 80 },
    height: { type: Number, default: 80 },
    shape: {
      type: String,
      enum: ['square', 'rectangle', 'round'],
      default: 'square',
    },
    rotation: { type: Number, default: 0 },
    // Status flags
    bookable: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate minimumCapacity <= capacity <= maximumCapacity
restaurantTableSchema.pre('save', function (next) {
  if (this.minimumCapacity > this.capacity) {
    return next(new Error('minimumCapacity cannot exceed capacity'));
  }
  if (this.maximumCapacity && this.maximumCapacity < this.capacity) {
    return next(new Error('maximumCapacity cannot be less than capacity'));
  }
  next();
});

restaurantTableSchema.index({ area: 1, active: 1 });
restaurantTableSchema.index({ bookable: 1, active: 1 });

module.exports = mongoose.model('RestaurantTable', restaurantTableSchema);
