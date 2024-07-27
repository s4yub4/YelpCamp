const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

router.post(
	'/',
	isLoggedIn,
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		review.author = req.user._id;
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash('success', 'Create new review!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	catchAsync(async (req, res, next) => {
		const {id, reviewId} = req.params;
		await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
		await Review.findByIdAndDelete(reviewId);
		req.flash('error', 'Deleted campground!');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
