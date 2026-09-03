const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Event = require('../models/Event');

// ─── Multer Config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/events');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `event-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed'), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute the next occurrence of a given weekday name from today.
 * Returns YYYY-MM-DD string.
 */
function computeNextOccurrence(dayName) {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetIdx = DAYS.indexOf(dayName);
  if (targetIdx === -1) return null;

  const now = new Date();
  const todayIdx = now.getDay();
  let daysAhead = targetIdx - todayIdx;
  // If the target day is today but has already passed, schedule for next week
  if (daysAhead < 0) daysAhead += 7;
  if (daysAhead === 0) {
    // It's today — show today
  }
  const next = new Date(now);
  next.setDate(now.getDate() + daysAhead);
  const yyyy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const formatEvent = (ev, computeWeeklyDate = false) => {
  const obj = {
    _id: ev._id,
    title: ev.title,
    description: ev.description,
    category: ev.category,
    sportType: ev.sportType || '',
    date: ev.date,
    time: ev.time,
    recurrenceDay: ev.recurrenceDay || '',
    photo: ev.photo || null,
    price: ev.price ?? null,
    capacity: ev.capacity ?? null,
    spotsLeft: ev.spotsLeft ?? null,
    tags: ev.tags || [],
    cta_label: ev.cta_label,
    cta_link: ev.cta_link,
    status: ev.status,
    is_featured: ev.is_featured,
    is_trending: ev.is_trending,
    trending_score: ev.trending_score,
    display_order: ev.display_order,
    createdAt: ev.createdAt,
    updatedAt: ev.updatedAt,
  };

  // For weekly events, compute the next occurrence date
  if (computeWeeklyDate && ev.category === 'weekly' && ev.recurrenceDay) {
    const nextDate = computeNextOccurrence(ev.recurrenceDay);
    if (nextDate) obj.date = nextDate;
  }

  return obj;
};

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * GET /api/events?tab=upcoming|weekly|tournament
 *
 * - tab=upcoming (default): all categories, status=upcoming, sorted by soonest date
 * - tab=weekly: category=weekly only, computes next occurrence
 * - tab=tournament: category=tournament only
 *
 * Always excludes completed/cancelled/draft for public view.
 */
exports.getPublicEvents = async (req, res, next) => {
  try {
    const { tab = 'upcoming' } = req.query;
    const publicStatuses = ['upcoming', 'ongoing'];

    let filter = { status: { $in: publicStatuses } };
    let computeWeekly = false;

    switch (tab) {
      case 'weekly':
        filter.category = 'weekly';
        computeWeekly = true;
        break;
      case 'tournament':
        filter.category = 'tournament';
        break;
      case 'upcoming':
      default:
        // All categories, sorted by soonest date
        computeWeekly = true;
        break;
    }

    const events = await Event.find(filter).sort({ date: 1, display_order: 1 });
    const formatted = events.map(ev => formatEvent(ev, computeWeekly));

    // Sort by computed date for upcoming tab (weekly events may have shifted dates)
    if (tab === 'upcoming' || tab === 'weekly') {
      formatted.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    }

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

/**
 * GET /api/admin/events
 */
exports.getAllEventsAdmin = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ success: true, data: events.map(ev => formatEvent(ev, true)) });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/events
 */
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title, description, category, sportType, date, time, recurrenceDay,
      cta_label, cta_link, status, is_featured, is_trending, trending_score,
      display_order, price, capacity, spotsLeft, tags,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'title and date are required' },
      });
    }

    const event = await Event.create({
      title,
      description,
      category: category || 'special',
      sportType: sportType || '',
      date,
      time,
      recurrenceDay: recurrenceDay || '',
      cta_label: cta_label || 'Book Now',
      cta_link: cta_link || '#booking',
      status: status || 'upcoming',
      is_featured: Boolean(is_featured),
      is_trending: Boolean(is_trending),
      trending_score: Number(trending_score) || 0,
      display_order: Number(display_order) || 0,
      price: price != null ? Number(price) : null,
      capacity: capacity != null ? Number(capacity) : null,
      spotsLeft: spotsLeft != null ? Number(spotsLeft) : null,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
    });

    res.status(201).json({ success: true, data: formatEvent(event, true) });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/events/:id
 */
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Coerce booleans coming from form-data (they arrive as strings)
    if (updates.is_featured !== undefined) updates.is_featured = updates.is_featured === true || updates.is_featured === 'true';
    if (updates.is_trending !== undefined) updates.is_trending = updates.is_trending === true || updates.is_trending === 'true';
    if (updates.trending_score !== undefined) updates.trending_score = Number(updates.trending_score);
    if (updates.display_order !== undefined) updates.display_order = Number(updates.display_order);
    if (updates.price !== undefined) updates.price = updates.price != null && updates.price !== '' ? Number(updates.price) : null;
    if (updates.capacity !== undefined) updates.capacity = updates.capacity != null && updates.capacity !== '' ? Number(updates.capacity) : null;
    if (updates.spotsLeft !== undefined) updates.spotsLeft = updates.spotsLeft != null && updates.spotsLeft !== '' ? Number(updates.spotsLeft) : null;
    if (updates.tags !== undefined) {
      updates.tags = Array.isArray(updates.tags) ? updates.tags : (typeof updates.tags === 'string' ? updates.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    }

    const event = await Event.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    res.json({ success: true, data: formatEvent(event, true) });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/events/:id
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    // Remove the uploaded photo file if exists
    if (event.photo) {
      const filePath = path.join(__dirname, '..', event.photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ success: true, data: { _id: id } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/events/:id/feature
 * Toggle the is_featured flag.
 */
exports.toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }
    event.is_featured = !event.is_featured;
    await event.save();
    res.json({ success: true, data: formatEvent(event, true) });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/events/:id/photo
 * Multipart photo upload. Uses exports.upload middleware.
 */
exports.uploadEventPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No image file provided' } });
    }

    const photoUrl = `/uploads/events/${req.file.filename}`;
    const event = await Event.findByIdAndUpdate(id, { photo: photoUrl }, { new: true });
    if (!event) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    res.json({ success: true, data: { photo: photoUrl } });
  } catch (err) {
    next(err);
  }
};
