const Subscriber = require('../models/Subscriber');

exports.subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      error.code = 'MISSING_EMAIL';
      throw error;
    }
    
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      const error = new Error('Email is already subscribed');
      error.statusCode = 400;
      error.code = 'ALREADY_SUBSCRIBED';
      throw error;
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    
    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to the newsletter'
    });
  } catch (error) {
    next(error);
  }
};
