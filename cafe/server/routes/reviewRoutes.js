const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// GET all reviews
router.get('/', reviewController.getReviews);

// POST a new review (with image)
router.post('/', reviewController.upload.single('image'), reviewController.createReview);

// DELETE a review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
