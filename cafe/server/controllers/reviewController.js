const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Review = require('../models/Review');

// ─── Multer Config ────────────────────────────────────────────────────────────
const storage = multer.memoryStorage();

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

// ─── Controllers ──────────────────────────────────────────────────────────────

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ order: 1, createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
};

// @route   POST /api/reviews
// @desc    Create a new review (with image upload)
// @access  Admin
exports.createReview = async (req, res) => {
  try {
    const { name, order, text } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Review image is required' });
    }

    // Process image with sharp
    const filename = `review-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const uploadDir = path.join(__dirname, '../uploads/reviews');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filepath = path.join(uploadDir, filename);

    // Optimize image (resize width to max 1200 to keep quality but reduce size)
    await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(filepath);

    const imageUrl = `/uploads/reviews/${filename}`;

    const newReview = new Review({
      name,
      imageUrl,
      text,
      order: order || 0
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error creating review' });
  }
};

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Delete image file if it exists
    if (review.imageUrl) {
      const filename = path.basename(review.imageUrl);
      const filepath = path.join(__dirname, '../../public/uploads/reviews', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error deleting review' });
  }
};
