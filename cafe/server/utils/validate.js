/**
 * Validation Utilities
 * Reusable field validators for booking-related requests.
 * Backend validation is mandatory regardless of frontend validation.
 */

const PHONE_REGEX = /^[+]?[\d\s\-().]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([0-1]?\d|2[0-3]):[0-5]\d$/;

const validators = {
  name: (val) => {
    if (!val || typeof val !== 'string') return 'Name is required';
    if (val.trim().length < 2) return 'Name must be at least 2 characters';
    if (val.trim().length > 100) return 'Name must be under 100 characters';
    return null;
  },

  phone: (val) => {
    if (!val) return 'Phone number is required';
    if (!PHONE_REGEX.test(val)) return 'Invalid phone number format';
    return null;
  },

  email: (val) => {
    if (!val) return null; // email is often optional
    if (!EMAIL_REGEX.test(val)) return 'Invalid email address';
    return null;
  },

  date: (val) => {
    if (!val) return 'Date is required';
    if (!DATE_REGEX.test(val)) return 'Date must be in YYYY-MM-DD format';
    const parsed = new Date(val);
    if (isNaN(parsed.getTime())) return 'Invalid date';
    if (parsed < new Date(new Date().setHours(0, 0, 0, 0))) return 'Date cannot be in the past';
    return null;
  },

  time: (val) => {
    if (!val) return 'Time is required';
    if (!TIME_REGEX.test(val)) return 'Time must be in HH:MM (24-hour) format';
    return null;
  },

  guestCount: (val, min = 1, max = 100) => {
    const n = parseInt(val, 10);
    if (isNaN(n)) return 'Guest count must be a number';
    if (n < min) return `Minimum guest count is ${min}`;
    if (n > max) return `Maximum guest count is ${max}`;
    return null;
  },

  requiredString: (val, fieldName) => {
    if (!val || typeof val !== 'string' || val.trim().length === 0) {
      return `${fieldName} is required`;
    }
    return null;
  },
};

/**
 * Validate a set of fields against the validators.
 * @param {Object} fields - { validatorKey: value }
 * @returns {{ isValid: boolean, errors: Object }}
 */
const validateFields = (fields) => {
  const errors = {};

  for (const [key, val] of Object.entries(fields)) {
    const validator = validators[key];
    if (validator) {
      const error = validator(val);
      if (error) errors[key] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Express middleware factory for request validation.
 * Usage: router.post('/bookings', validate({ name: req.body.name, ... }), controller)
 */
const validate = (extractFields) => (req, res, next) => {
  const fields = typeof extractFields === 'function'
    ? extractFields(req)
    : extractFields;

  const { isValid, errors } = validateFields(fields);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        fields: errors,
      },
    });
  }

  next();
};

module.exports = { validators, validateFields, validate };
