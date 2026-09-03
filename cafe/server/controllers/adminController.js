const TableBooking = require('../models/TableBooking');
const RestaurantTable = require('../models/RestaurantTable');
const RestaurantArea = require('../models/RestaurantArea');
const Customer = require('../models/Customer');
const BookingHistory = require('../models/BookingHistory');

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
    if (email === 'admin@rsportscafe.com' && password === 'admin123') {
      const adminUser = {
        id: 'admin_1',
        name: 'Executive Concierge',
        email: 'admin@rsportscafe.com',
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

    const totalBookings = await TableBooking.countDocuments();
    const todayBookings = await TableBooking.countDocuments({ bookingDate: todayISO });
    const pendingBookings = await TableBooking.countDocuments({ status: 'PENDING' });
    const confirmedBookings = await TableBooking.countDocuments({ status: 'CONFIRMED' });

    const totalTables = await RestaurantTable.countDocuments();
    const activeAreas = await RestaurantArea.countDocuments({ active: true });
    const totalCustomers = await Customer.countDocuments();

    const recentBookings = await TableBooking.find()
      .populate('customer', 'name phone email')
      .populate('area', 'name')
      .populate('table', 'name capacity')
      .sort({ createdAt: -1 })
      .limit(6);

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
 * GET /api/admin/bookings
 * Returns table bookings list with search & status filter
 */
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    let bookings = await TableBooking.find(query)
      .populate('customer', 'name phone email totalBookings')
      .populate('area', 'name')
      .populate('table', 'name capacity')
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter((b) => {
        const name = b.customer?.name?.toLowerCase() || '';
        const phone = b.customer?.phone?.toLowerCase() || '';
        const ref = b.bookingNumber?.toLowerCase() || '';
        return name.includes(q) || phone.includes(q) || ref.includes(q);
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
 * PATCH /api/admin/bookings/:id/status
 * Updates status of a booking
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

    const booking = await TableBooking.findById(id);
    if (!booking) {
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
