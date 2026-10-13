const TableBooking = require('../models/TableBooking');
const RestaurantTable = require('../models/RestaurantTable');
const RestaurantArea = require('../models/RestaurantArea');
const Customer = require('../models/Customer');
const BookingHistory = require('../models/BookingHistory');
const Booking = require('../models/Booking');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadTablePhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

/**
 * POST /api/admin/login
 * Admin Login endpoint (Demo auth token provider)
 */
exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' },
      });
    }

    // Demo admin check (accepts admin credentials)
    if (email === 'san@gmail.com' && password === 'san@2604') {
      const adminUser = {
        id: 'admin_1',
        name: 'Executive Concierge',
        email: 'san@gmail.com',
        role: 'SUPER_ADMIN',
      };

      res.cookie('authToken', 'admin-session-token', {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return res.json({
        success: true,
        data: {
          token: 'admin-session-token',
          user: adminUser,
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid admin email or password' },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/overview
 * Returns KPI metrics and statistics for the dashboard
 */
exports.getOverviewStats = async (req, res, next) => {
  try {
    const todayISO = new Date().toISOString().split('T')[0];

    const totalTable = await TableBooking.countDocuments();
    const totalGeneral = await Booking.countDocuments();
    const totalBookings = totalTable + totalGeneral;

    const todayBookings = (await TableBooking.countDocuments({ bookingDate: todayISO })) +
      (await Booking.countDocuments({ date: todayISO }));

    const pendingBookings = (await TableBooking.countDocuments({ status: 'PENDING' })) +
      (await Booking.countDocuments({ status: { $in: ['PENDING', null] } }));

    const confirmedBookings = (await TableBooking.countDocuments({ status: 'CONFIRMED' })) +
      (await Booking.countDocuments({ status: 'CONFIRMED' }));

    const totalTables = await RestaurantTable.countDocuments();
    const activeAreas = await RestaurantArea.countDocuments({ active: true });
    const totalCustomers = await Customer.countDocuments();

    const recentTable = await TableBooking.find()
      .populate('customer', 'name phone email')
      .populate('area', 'name')
      .populate('table', 'name capacity')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    const recentGeneral = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    const formattedGeneral = recentGeneral.map(g => ({
      _id: g._id,
      bookingNumber: g.bookingNumber || ('ENQ-' + g._id.toString().slice(-4).toUpperCase()),
      customer: { name: g.name, email: g.email, phone: g.phone || '-' },
      name: g.name,
      phone: g.phone || '-',
      email: g.email || '-',
      bookingDate: g.date || (g.createdAt ? new Date(g.createdAt).toISOString().split('T')[0] : 'TBD'),
      startTime: g.time || '-',
      guestCount: g.guests || g.guestCount || 2,
      area: { name: g.service ? g.service.replace(/-/g, ' ').toUpperCase() : 'General Enquiry' },
      table: { name: g.service ? g.service.replace(/-/g, ' ') : 'General' },
      occasion: g.service ? g.service.replace(/-/g, ' ') : 'General Enquiry',
      status: g.status || 'PENDING',
      createdAt: g.createdAt,
      isGeneral: true,
    }));

    const recentBookings = [...recentTable, ...formattedGeneral]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);

    res.json({
      success: true,
      data: {
        totalBookings,
        todayBookings,
        pendingBookings,
        confirmedBookings,
        totalTables,
        activeAreas,
        totalCustomers,
        recentBookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/notifications
 * Returns latest notifications & unread count
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find()
      .populate('customer', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ read: false });
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/notifications/:id/read
 * Mark a notification as read
 */
exports.markNotificationRead = async (req, res, next) => {
  try {
    const Notification = require('../models/Notification');
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true, readAt: new Date() });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/notifications/read-all
 * Mark all notifications as read
 */
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.updateMany({ read: false }, { read: true, readAt: new Date() });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/bookings
 * Returns legacy general-enquiry bookings
 */
exports.getAllLegacyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/table-bookings
 * Returns all bookings (both Table Reservations & General/Turf Enquiries)
 */
exports.getAllTableBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    let tableBookings = await TableBooking.find(query)
      .populate('customer', 'name phone email totalBookings')
      .populate('area', 'name')
      .populate('table', 'name capacity')
      .lean();

    // Also load general bookings (homepage VIP, turf, dining, party enquiries)
    let generalBookings = await Booking.find().lean();
    const formattedGeneral = generalBookings
      .filter((g) => !status || status === 'ALL' || (g.status || 'PENDING') === status)
      .map((g) => ({
        _id: g._id,
        bookingNumber: g.bookingNumber || ('ENQ-' + g._id.toString().slice(-4).toUpperCase()),
        customer: { name: g.name, email: g.email, phone: g.phone || '-' },
        name: g.name,
        phone: g.phone || '-',
        email: g.email || '-',
        bookingDate: g.date || (g.createdAt ? new Date(g.createdAt).toISOString().split('T')[0] : 'TBD'),
        startTime: g.time || '-',
        guestCount: g.guests || g.guestCount || 2,
        area: { name: g.service ? g.service.replace(/-/g, ' ').toUpperCase() : 'General Enquiry' },
        table: { name: g.service ? g.service.replace(/-/g, ' ') : 'Enquiry' },
        occasion: g.service ? g.service.replace(/-/g, ' ') : 'General Enquiry',
        status: g.status || 'PENDING',
        createdAt: g.createdAt,
        isGeneral: true,
      }));

    let bookings = [...tableBookings, ...formattedGeneral].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter((b) => {
        const name = (b.customer?.name || b.name || '').toLowerCase();
        const phone = (b.customer?.phone || b.phone || '').toLowerCase();
        const ref = (b.bookingNumber || '').toLowerCase();
        const service = (b.occasion || '').toLowerCase();
        return name.includes(q) || phone.includes(q) || ref.includes(q) || service.includes(q);
      });
    }

    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/table-bookings/:id/status
 * Updates status of a booking (handles both TableBooking and Booking models)
 */
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'ARRIVED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Status must be one of: ${validStatuses.join(', ')}` },
      });
    }

    let booking = await TableBooking.findById(id);
    if (!booking) {
      // Check general/enquiry booking
      const genBooking = await Booking.findById(id);
      if (genBooking) {
        genBooking.status = status;
        await genBooking.save();
        return res.json({ success: true, data: genBooking });
      }

      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Booking not found' },
      });
    }

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    await BookingHistory.create({
      booking: booking._id,
      action: 'STATUS_CHANGE',
      oldValue: { status: oldStatus },
      newValue: { status },
      note: note || `Status updated to ${status} via Admin Dashboard`,
    });

    const updated = await TableBooking.findById(id)
      .populate('customer', 'name phone email')
      .populate('area', 'name')
      .populate('table', 'name capacity');

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/tables
 * Returns tables grouped by areas
 */
exports.getAllTables = async (req, res, next) => {
  try {
    const areas = await RestaurantArea.find({ active: true }).sort({ displayOrder: 1 });
    const tables = await RestaurantTable.find().populate('area', 'name');

    res.json({
      success: true,
      data: {
        areas,
        tables,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/areas
 * Creates a new restaurant area
 */
exports.createArea = async (req, res, next) => {
  try {
    const newArea = new RestaurantArea(req.body);
    const savedArea = await newArea.save();
    res.status(201).json({ success: true, data: savedArea });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/areas/:id
 * Updates a restaurant area
 */
exports.updateArea = async (req, res, next) => {
  try {
    const updatedArea = await RestaurantArea.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedArea) {
      return res.status(404).json({ success: false, error: { message: 'Area not found' } });
    }
    res.json({ success: true, data: updatedArea });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/areas/:id
 * Deletes a restaurant area
 */
exports.deleteArea = async (req, res, next) => {
  try {
    const deletedArea = await RestaurantArea.findByIdAndDelete(req.params.id);
    if (!deletedArea) {
      return res.status(404).json({ success: false, error: { message: 'Area not found' } });
    }
    // Note: In production you might want to prevent deleting areas that have tables or bookings
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/tables
 * Creates a new restaurant table
 */
exports.createTable = async (req, res, next) => {
  try {
    const newTable = new RestaurantTable(req.body);
    const savedTable = await newTable.save();
    res.status(201).json({ success: true, data: savedTable });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/tables/:id
 * Updates a restaurant table
 */
exports.updateTable = async (req, res, next) => {
  try {
    const updatedTable = await RestaurantTable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedTable) {
      return res.status(404).json({ success: false, error: { message: 'Table not found' } });
    }
    res.json({ success: true, data: updatedTable });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/tables/:id
 * Deletes a restaurant table
 */
exports.deleteTable = async (req, res, next) => {
  try {
    const deletedTable = await RestaurantTable.findByIdAndDelete(req.params.id);
    if (!deletedTable) {
      return res.status(404).json({ success: false, error: { message: 'Table not found' } });
    }
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/tables/:id/photo
 * Uploads a photo for a table
 */
exports.uploadTablePhotoHandler = [
  uploadTablePhoto.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { message: 'No photo provided' } });
      }

      const dir = path.join(__dirname, '../uploads/tables');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `table-${Date.now()}.webp`;
      await sharp(req.file.buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(dir, filename));

      const table = await RestaurantTable.findByIdAndUpdate(
        req.params.id,
        { photo: `/uploads/tables/${filename}` },
        { new: true }
      );

      if (!table) {
        return res.status(404).json({ success: false, error: { message: 'Table not found' } });
      }

      res.json({ success: true, data: table });
    } catch (err) {
      next(err);
    }
  },
];

/**
 * GET /api/admin/customers
 * Returns all customers
 */
exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: customers,
    });
  } catch (err) {
    next(err);
  }
};
