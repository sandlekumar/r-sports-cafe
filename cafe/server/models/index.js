/**
 * Model registry
 * Require all models here so Mongoose registers them before any route handler runs.
 * Import this file once in server/index.js.
 */

require('./AdminUser');
require('./Customer');
require('./RestaurantArea');
require('./RestaurantTable');
require('./TableBooking');
require('./BookingSlotLock');
require('./BookingHistory');
require('./EventBooking');
require('./Event');
require('./MenuItem');
require('./Reel');
require('./ContactEnquiry');
require('./BusinessHours');
require('./BlockedDate');
require('./BlockedTimeSlot');
require('./Notification');
require('./Settings');

// Legacy models from original server setup
require('./Booking');
require('./Subscriber');
