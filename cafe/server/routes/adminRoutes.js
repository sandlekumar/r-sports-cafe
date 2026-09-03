/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const eventController = require('../controllers/eventController');
const menuController = require('../controllers/menuController');
const reelController = require('../controllers/reelController');

// Public admin login endpoint (supports POST and GET for health checks)
router.post('/login', adminController.loginAdmin);
router.get('/login', (req, res) => res.json({ success: true, message: 'Admin login endpoint ready (send POST to authenticate)' }));

// Protected admin endpoints
router.use(authMiddleware);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Admin API is reachable', user: req.user });
});

router.get('/overview', adminController.getOverviewStats);
router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);
router.get('/tables', adminController.getAllTables);
router.get('/customers', adminController.getAllCustomers);

// Events CRUD
router.get('/events', eventController.getAllEventsAdmin);
router.post('/events', eventController.createEvent);
router.put('/events/:id', eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);
router.patch('/events/:id/feature', eventController.toggleFeatured);
router.post('/events/:id/photo', eventController.upload.single('photo'), eventController.uploadEventPhoto);

// Menu Items CRUD & Video/Photo Uploads
router.get('/menu', menuController.getAllMenuItemsAdmin);
router.post('/menu', menuController.createMenuItem);
router.put('/menu/:id', menuController.updateMenuItem);
router.delete('/menu/:id', menuController.deleteMenuItem);
router.post('/menu/:id/photo', menuController.upload.single('photo'), menuController.uploadMenuPhoto);
router.post('/menu/:id/video', menuController.upload.single('video'), menuController.uploadMenuVideo);

// Reels CRUD & Video Upload
router.get('/reels', reelController.getAllReelsAdmin);
router.post('/reels', reelController.createReel);
router.put('/reels/:id', reelController.updateReel);
router.delete('/reels/:id', reelController.deleteReel);
router.post('/reels/:id/video', reelController.upload.single('video'), reelController.uploadReelVideo);

module.exports = router;

