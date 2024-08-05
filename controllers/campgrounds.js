const Campground = require('../models/campground');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req, res, next) => {
	const campgrounds = await Campground.find({}).populate({path: 'popupText', strictPopulate: false});
	res.render('campgrounds/index', {campgrounds});
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
	const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.features[0].geometry;
	campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
	campground.author = req.user._id;
	await campground.save();
	req.flash('success', 'Successfully made a new campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
	const {id} = req.params;
	const campground = await Campground.findById(id)
		.populate({path: 'reviews', populate: {path: 'author'}})
		.populate('author');
	if (!campground) {
		req.flash('error', 'Cannot find that campground');
		return res.redirect('/campgrounds');
	}
	// console.log(campground);
	res.render('campgrounds/show', {campground});
};

module.exports.renderEditForm = async (req, res, next) => {
	const {id} = req.params;
	const campground = await Campground.findById(id);
	if (!campground) {
		req.flash('error', 'Cannot find the campground');
		return res.redirect(`/campgrounds`);
	}
	res.render('campgrounds/edit', {campground});
};

module.exports.updateCampground = async (req, res, next) => {
	// console.log("Request Body:", req.body);
	// console.log("Files:", req.files);
	const {id} = req.params;
	const campground = await Campground.findByIdAndUpdate(id, {
		...req.body.campground
	});
	const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
	campground.geometry = geoData.features[0].geometry;
	const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
	campground.images.push(...imgs);
	await campground.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
	}
	req.flash('success', 'Successfully update the campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
	const {id} = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to do that');
		return res.redirect(`/campgrounds/${campground._id}`);
	}
	await Campground.findByIdAndDelete(id);
	req.flash('error', 'Deleted the campground!');
	res.redirect('/campgrounds');
};
