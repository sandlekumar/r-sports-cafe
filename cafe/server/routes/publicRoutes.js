const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const newsletterController = require('../controllers/newsletterController');
const availabilityController = require('../controllers/availabilityController');
const tableBookingController = require('../controllers/tableBookingController');
const eventController = require('../controllers/eventController');
const menuController = require('../controllers/menuController');
const reelController = require('../controllers/reelController');

// Table booking (new system)
router.get('/availability', availabilityController.getAvailability);
router.get('/areas', tableBookingController.getAreas);
router.post('/table-bookings', tableBookingController.createTableBooking);

// Public events (admin-managed event cards)
router.get('/events', eventController.getPublicEvents);

// Public menu items (with video motion loops)
router.get('/menu', menuController.getPublicMenuItems);

// Public reels (Instagram-style video clips)
router.get('/reels', reelController.getPublicReels);

// Legacy routes (general enquiry form + newsletter)
router.post('/bookings', bookingController.createBooking);
router.post('/newsletter', newsletterController.subscribeNewsletter);

module.exports = router;

