// const isLoggedIn = (req, res, next) => {
// 	if (!req.isAuthenticated()) {
// 		req.flash('error', 'You must be signed in');
// 		return res.redirect('/login');
// 	}
// 	next();
// };
// module.exports = isLoggedIn;

const storeReturnTo = (req, res, next) => {
	if (req.session.returnTo) {
		res.locals.returnTo = req.session.returnTo;
	}
	next();
};

const isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl; // add this line
		req.flash('error', 'You must be signed in first!');
		return res.redirect('/login');
	}
	next();
};

module.exports = {storeReturnTo, isLoggedIn};
