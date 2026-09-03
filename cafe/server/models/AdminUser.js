const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * ADMIN_USERS
 * Restaurant staff accounts. Passwords are hashed with bcrypt.
 * Roles determine what sections of the admin dashboard are accessible.
 */
const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'MANAGER', 'RECEPTION', 'EVENT_MANAGER'],
      default: 'RECEPTION',
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminUserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to verify password (Step 19)
adminUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminUserSchema.index({ active: 1 });

module.exports = mongoose.model('AdminUser', adminUserSchema);
