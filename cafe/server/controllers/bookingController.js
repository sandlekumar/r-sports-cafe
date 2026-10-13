const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

exports.createBooking = async (req, res, next) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();

    // Create Notification record for Admin Dashboard
    try {
      await Notification.create({
        type: 'BOOKING_CREATED',
        refModel: 'TableBooking',
        ref: savedBooking._id,
        message: `New Enquiry / Booking from ${savedBooking.name} (${savedBooking.service}) for ${savedBooking.date || 'TBD'} ${savedBooking.time || ''}`,
      });
    } catch (notifErr) {
      console.warn('Admin notification creation error:', notifErr.message);
    }

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
