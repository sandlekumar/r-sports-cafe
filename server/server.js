const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

// Import Models
const Event = require('./models/Event');
const Area = require('./models/Area');
const Table = require('./models/Table');
const Customer = require('./models/Customer');
const Booking = require('./models/Booking');
const Admin = require('./models/Admin');
const MenuItem = require('./models/MenuItem');
const Reel = require('./models/Reel');
const Newsletter = require('./models/Newsletter');
const jwt = require('jsonwebtoken');
const { protectAdmin } = require('./middleware/auth');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Removed in-memory events data store

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'R-Sports-Cafe API is running' });
});

// Admin overview
app.get('/api/admin/overview', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate Active Bookings (Pending or Confirmed for today or future)
    const activeBookingsCount = await Booking.countDocuments({
      status: { $in: ['PENDING', 'CONFIRMED'] },
      bookingDate: { $gte: today }
    });

    const recentBookings = await Booking.find()
      .populate('customer')
      .populate('table')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        metrics: [
          { label: 'Active Bookings', value: activeBookingsCount.toString(), trend: '+5%' }
        ],
        recentBookings: recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/tables', async (req, res) => {
  try {
    const areas = await Area.find();
    const tables = await Table.find().populate('area');
    res.json({
      success: true,
      data: { areas, tables }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bookings API
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer')
      .populate('table')
      .populate('area')
      .sort({ bookingDate: -1, startTime: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/admin/bookings/:id/status', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('customer').populate('table').populate('area');
    
    if (booking) {
      res.json({ success: true, data: booking });
    } else {
      res.status(404).json({ success: false, message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customers
app.get('/api/admin/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* EVENTS API (IN-MEMORY)                                                     */
/* -------------------------------------------------------------------------- */

// GET all events for public site
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET all events for admin dashboard
app.get('/api/admin/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new event
app.post('/api/admin/events', async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);
    res.json({ success: true, data: newEvent });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT (update) existing event
app.put('/api/admin/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE event
app.delete('/api/admin/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST event photo upload
app.post('/api/admin/events/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No photo uploaded' } });
    }

    const photoUrl = '/uploads/' + req.file.filename;
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { photo: photoUrl },
      { new: true }
    );
    
    if (event) {
      res.json({ success: true, data: event });
    } else {
      res.json({ success: true, data: { _id: req.params.id, photo: photoUrl } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* ADMIN AUTH API                                                             */
/* -------------------------------------------------------------------------- */
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (admin && (await admin.matchPassword(password))) {
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '30d' });
      res.json({ success: true, token, username: admin.username });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* PUBLIC BOOKINGS & AVAILABILITY API                                         */
/* -------------------------------------------------------------------------- */

// Check availability
app.get('/api/availability', async (req, res) => {
  try {
    const { date, guests } = req.query;
    if (!date || !guests) return res.status(400).json({ success: false, message: 'Date and guests are required' });
    
    // Find tables that can accommodate the guests
    const tables = await Table.find({ capacity: { $gte: Number(guests) } }).populate('area');
    
    // In a real app, you would check bookings for the specific date to filter out occupied tables
    // For now, we return tables that fit the guest count
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create public booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, phone, date, time, guests, tableId, areaId } = req.body;
    
    // 1. Find or create customer
    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = await Customer.create({ name, email, phone, totalBookings: 1 });
    } else {
      customer.totalBookings += 1;
      await customer.save();
    }
    
    // 2. Create booking
    const bookingNumber = 'BK-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking = await Booking.create({
      bookingNumber,
      customer: customer._id,
      table: tableId,
      area: areaId,
      bookingDate: new Date(date),
      startTime: time,
      guestCount: guests,
      status: 'PENDING'
    });
    
    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* MENU API                                                                   */
/* -------------------------------------------------------------------------- */

app.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/menu', protectAdmin, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/menu/:id', protectAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/menu/:id', protectAdmin, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/menu/:id/photo', protectAdmin, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No photo uploaded' });
    const photoUrl = '/uploads/' + req.file.filename;
    const item = await MenuItem.findByIdAndUpdate(req.params.id, { photoUrl }, { new: true });
    res.json({ success: true, data: item || { _id: req.params.id, photoUrl } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* REELS API                                                                  */
/* -------------------------------------------------------------------------- */

app.get('/api/reels', async (req, res) => {
  try {
    const reels = await Reel.find({ isActive: true });
    res.json({ success: true, data: reels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/reels', protectAdmin, async (req, res) => {
  try {
    const reels = await Reel.find();
    res.json({ success: true, data: reels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/reels', protectAdmin, async (req, res) => {
  try {
    const reel = await Reel.create(req.body);
    res.status(201).json({ success: true, data: reel });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/reels/:id', protectAdmin, async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: reel });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/reels/:id', protectAdmin, async (req, res) => {
  try {
    await Reel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Reel deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/reels/:id/video', protectAdmin, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video uploaded' });
    const videoUrl = '/uploads/' + req.file.filename;
    const reel = await Reel.findByIdAndUpdate(req.params.id, { videoUrl }, { new: true });
    res.json({ success: true, data: reel || { _id: req.params.id, videoUrl } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/* NEWSLETTER API                                                             */
/* -------------------------------------------------------------------------- */

app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    let subscriber = await Newsletter.findOne({ email });
    if (subscriber) {
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }
    subscriber = await Newsletter.create({ email });
    res.status(201).json({ success: true, data: subscriber });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/* -------------------------------------------------------------------------- */

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
