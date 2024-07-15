const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
// image: `https://picsum.photos/400?random=${Math.random()}`
mongoose
	.connect("mongodb://localhost:27017/yelp-camp")
	.then(() => {
		console.log("Mongo connection open");
	})
	.catch((err) => {
		console.log(err);
	});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const sample = (array) => {
	return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
	await Campground.deleteMany({});
	const price = Math.floor(Math.random() * 20) + 20;
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const camp = new Campground({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			image: `https://picsum.photos/400?random=${Math.random()}`,
			description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur tempora numquam quia accusamus odio molestiae, sed repellat qui quam natus distinctio explicabo! Nostrum eveniet animi est ullam sit quibusdam voluptatum?`,
			price: price
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
