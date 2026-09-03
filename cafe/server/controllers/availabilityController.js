const { checkAvailability } = require('../services/availabilityService');
const { validateFields } = require('../utils/validate');

/**
 * GET /api/public/availability
 *
 * Query params: date, time, guests, areaId (optional)
 * Returns: available tables and areas for that window.
 */
exports.getAvailability = async (req, res, next) => {
  try {
    const { date, time, guests, areaId } = req.query;

    // Validate required query params
    const { isValid, errors } = validateFields({
      date,
      time,
      guestCount: parseInt(guests, 10),
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          fields: errors,
        },
      });
    }

    const result = await checkAvailability({
      date,
      time,
      guests: parseInt(guests, 10),
      areaId: areaId || null,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    // Availability errors have a known statusCode and code
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      });
    }
    next(err);
  }
};
