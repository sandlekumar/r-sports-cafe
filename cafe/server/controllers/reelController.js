const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Reel = require('../models/Reel');

// ─── Multer Storage Config ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/reels');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `reel-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^video\/(mp4|webm|quicktime)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4, WebM or MOV video files are allowed'), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 35 * 1024 * 1024 }, // 35 MB max for video reels
});

// Helper formatter
const formatReel = (r) => ({
  _id: r._id,
  id: r._id,
  src: r.videoUrl,
  videoUrl: r.videoUrl,
  caption: r.caption,
  handle: r.handle || '@rsports.cafe',
  tag: r.tag || 'HIGHLIGHTS',
  likes: r.likes || '1.2K',
  comments: r.comments || '45',
  status: r.status || 'active',
  display_order: r.display_order || 0,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

// ─── Public Endpoint ─────────────────────────────────────────────────────────

/**
 * GET /api/reels
 * Returns active reels for public showcase section
 */
exports.getPublicReels = async (req, res, next) => {
  try {
    const reels = await Reel.find({ status: 'active' }).sort({ display_order: 1, createdAt: 1 });
    res.json({ success: true, data: reels.map(formatReel) });
  } catch (err) {
    next(err);
  }
};

// ─── Admin Endpoints ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/reels
 */
exports.getAllReelsAdmin = async (req, res, next) => {
  try {
    const reels = await Reel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reels.map(formatReel) });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/reels
 */
exports.createReel = async (req, res, next) => {
  try {
    const { caption, handle, videoUrl, tag, likes, comments, status, display_order } = req.body;

    if (!caption || !videoUrl) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Caption and Video URL are required' },
      });
    }

    const reel = await Reel.create({
      caption,
      handle: handle || '@rsports.cafe',
      videoUrl,
      tag: tag || 'HIGHLIGHTS',
      likes: likes || '1.2K',
      comments: comments || '45',
      status: status || 'active',
      display_order: Number(display_order) || 0,
    });

    res.status(201).json({ success: true, data: formatReel(reel) });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/reels/:id
 */
exports.updateReel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.display_order !== undefined) updates.display_order = Number(updates.display_order);

    const reel = await Reel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!reel) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Reel not found' } });
    }

    res.json({ success: true, data: formatReel(reel) });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/reels/:id
 */
exports.deleteReel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findByIdAndDelete(id);
    if (!reel) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Reel not found' } });
    }

    // Clean up uploaded video if local
    if (reel.videoUrl && reel.videoUrl.startsWith('/uploads')) {
      const videoPath = path.join(__dirname, '..', reel.videoUrl);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    }

    res.json({ success: true, data: { _id: id } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/reels/:id/video
 */
exports.uploadReelVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No video file provided' } });
    }

    const videoUrl = `/uploads/reels/${req.file.filename}`;
    const reel = await Reel.findByIdAndUpdate(id, { videoUrl }, { new: true });
    if (!reel) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Reel not found' } });
    }

    res.json({ success: true, data: formatReel(reel) });
  } catch (err) {
    next(err);
  }
};
