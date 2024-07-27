const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

// routing
router.get(
	'/',
	catchAsync(async (req, res, next) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', {campgrounds});
	})
);

router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		campground.author = req.user._id;
		await campground.save();
		req.flash('success', 'Successfully made a new campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.get(
	'/:id',
	catchAsync(async (req, res, next) => {
		const {id} = req.params;
		const campground = await Campground.findById(id)
			.populate({path: 'reviews', populate: {path: 'author'}})
			.populate('author');
		if (!campground) {
			req.flash('error', 'Cannot find that campground');
			res.redirect('/campgrounds');
		}
		// console.log(campground);
		res.render('campgrounds/show', {campground});
	})
);

router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res, next) => {
		const {id} = req.params;
		const campground = await Campground.findById(id);
		if (!campground) {
			req.flash('error', 'Cannot find the campground');
			return res.redirect(`/campgrounds`);
		}
		res.render('campgrounds/edit', {campground});
	})
);

router.put(
	'/:id',
	isLoggedIn,
	isAuthor,
	validateCampground,
	catchAsync(async (req, res, next) => {
		const {id} = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground
		});
		req.flash('success', 'Successfully update the campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.delete(
	'/:id',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res, next) => {
		const {id} = req.params;
		const campground = await Campground.findById(id);
		if (!campground.author.equals(req.user._id)) {
			req.flash('error', 'You do not have permission to do that');
			return res.redirect(`/campgrounds/${campground._id}`);
		}
		await Campground.findByIdAndDelete(id);
		req.flash('error', 'Deleted the campground!');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
