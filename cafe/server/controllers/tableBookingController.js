const { createTableBooking } = require('../services/tableBookingService');
const { validateFields } = require('../utils/validate');

/**
 * POST /api/public/table-bookings
 * Creates a new table booking. Atomic — prevents double booking.
 */
exports.createTableBooking = async (req, res, next) => {
  try {
    const { name, phone, whatsapp, email, date, time, guests, areaId, tableId, occasion, specialRequest } = req.body;

    const { isValid, errors } = validateFields({
      name,
      phone,
      date,
      time,
      guestCount: parseInt(guests, 10),
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', fields: errors },
      });
    }

    const result = await createTableBooking({
      name, phone, whatsapp, email,
      date, time,
      guests: parseInt(guests, 10),
      areaId, tableId,
      occasion, specialRequest,
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: { code: err.code, message: err.message },
      });
    }
    next(err);
  }
};

/**
 * GET /api/public/areas
 * Returns all active restaurant areas for the booking form.
 */
exports.getAreas = async (req, res, next) => {
  try {
    const RestaurantArea = require('../models/RestaurantArea');
    const areas = await RestaurantArea.find({ active: true }).sort({ displayOrder: 1 });
    res.json({ success: true, data: areas });
  } catch (err) {
    next(err);
  }
};
