const Booking = require('../models/Booking');

exports.createBooking = async (req, res, next) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json({
      success: true,
      data: savedBooking,
      message: 'Booking received successfully'
    });
  } catch (error) {
    // Pass to global error handler
    error.statusCode = 400;
    error.code = 'BOOKING_CREATION_FAILED';
    next(error);
  }
};
