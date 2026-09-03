const path = require('path');
const fs = require('fs');
const multer = require('multer');
const MenuItem = require('../models/MenuItem');

// ─── Multer Storage Config ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/menu');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'video' ? 'menu-video' : 'menu-photo';
    cb(null, `${prefix}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) || /^video\/(mp4|webm|quicktime)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, GIF images or MP4, WebM videos are allowed'), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max
});

// Helper formatter
const formatMenuItem = (m) => ({
  _id: m._id,
  name: m.name,
  category: m.category,
  desc: m.desc,
  price: m.price,
  photo: m.photo || null,
  video_loop_url: m.video_loop_url || null,
  is_trending: m.is_trending || false,
  trending_score: m.trending_score || 0,
  accent: m.accent || '#C8956C',
  status: m.status || 'active',
  display_order: m.display_order || 0,
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
});

// ─── Public Endpoint ─────────────────────────────────────────────────────────

/**
 * GET /api/menu
 * Returns active menu items for public showcase cards
 */
exports.getPublicMenuItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ status: 'active' }).sort({ display_order: 1, createdAt: 1 });
    res.json({ success: true, data: items.map(formatMenuItem) });
  } catch (err) {
    next(err);
  }
};

// ─── Admin Endpoints ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/menu
 */
exports.getAllMenuItemsAdmin = async (req, res, next) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items.map(formatMenuItem) });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/menu
 */
exports.createMenuItem = async (req, res, next) => {
  try {
    const { name, category, desc, price, photo, video_loop_url, is_trending, trending_score, accent, status, display_order } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name and price are required' },
      });
    }

    const item = await MenuItem.create({
      name,
      category: category || 'SIGNATURE BURGER',
      desc: desc || '',
      price,
      photo: photo || null,
      video_loop_url: video_loop_url || null,
      is_trending: Boolean(is_trending),
      trending_score: Number(trending_score) || 0,
      accent: accent || '#C8956C',
      status: status || 'active',
      display_order: Number(display_order) || 0,
    });

    res.status(201).json({ success: true, data: formatMenuItem(item) });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/menu/:id
 */
exports.updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.is_trending !== undefined) updates.is_trending = updates.is_trending === true || updates.is_trending === 'true';
    if (updates.trending_score !== undefined) updates.trending_score = Number(updates.trending_score);
    if (updates.display_order !== undefined) updates.display_order = Number(updates.display_order);

    const item = await MenuItem.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Menu item not found' } });
    }

    res.json({ success: true, data: formatMenuItem(item) });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/menu/:id
 */
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Menu item not found' } });
    }

    // Clean up uploaded files if present
    if (item.photo) {
      const photoPath = path.join(__dirname, '..', item.photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }
    if (item.video_loop_url) {
      const videoPath = path.join(__dirname, '..', item.video_loop_url);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    }

    res.json({ success: true, data: { _id: id } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/menu/:id/photo
 */
exports.uploadMenuPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No image file provided' } });
    }

    const photoUrl = `/uploads/menu/${req.file.filename}`;
    const item = await MenuItem.findByIdAndUpdate(id, { photo: photoUrl }, { new: true });
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Menu item not found' } });
    }

    res.json({ success: true, data: formatMenuItem(item) });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/menu/:id/video
 */
exports.uploadMenuVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No video file provided' } });
    }

    const videoUrl = `/uploads/menu/${req.file.filename}`;
    const item = await MenuItem.findByIdAndUpdate(id, { video_loop_url: videoUrl, is_trending: true }, { new: true });
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Menu item not found' } });
    }

    res.json({ success: true, data: formatMenuItem(item) });
  } catch (err) {
    next(err);
  }
};
