const mongoose = require('mongoose');

/**
 * RESTAURANT_AREAS
 * Physical zones of the restaurant (e.g., Main Indoor, Outdoor, VIP).
 * Admin can add, rename, reorder, enable/disable without editing code.
 */
const restaurantAreaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Area name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
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

restaurantAreaSchema.index({ active: 1, displayOrder: 1 });

module.exports = mongoose.model('RestaurantArea', restaurantAreaSchema);
