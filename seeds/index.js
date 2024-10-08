const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');
// image: `https://picsum.photos/400?random=${Math.random()}`
mongoose
	.connect('mongodb://localhost:27017/yelp-camp')
	.then(() => {
		console.log('Mongo connection open');
	})
	.catch(err => {
		console.log(err);
	});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const sample = array => {
	return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 300; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			// (user, <-same)
			author: '66a0f841a57cb426441929a1',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur tempora numquam quia accusamus odio molestiae, sed repellat qui quam natus distinctio explicabo! Nostrum eveniet animi est ullam sit quibusdam voluptatum?`,
			price: price,
			geometry: {
				type: 'Point',
				coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
			},
			images: [
				{
					url: `https://picsum.photos/400?random=${Math.random()}`,
					filename: `YelpCamp/${Math.random()}`
				},
				{
					url: `https://picsum.photos/400?random=${Math.random()}`,
					filename: `YelpCamp/${Math.random()}`
				}
			]
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
