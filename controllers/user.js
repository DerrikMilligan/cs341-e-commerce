import path from 'path';

import { UserModel } from '../models/index.js';

import { getDirname } from '../util/index.js';

const __dirname = getDirname();

// Just check the data for the username and password
const verifyDataHasUsernamePassword = (data) => {
	return (
		data.username !== undefined &&
		data.password !== undefined &&
		data.username.trim().length > 0 &&
		data.password.trim().length > 0
	);
}

export default {
	// Just display the login page
	getLogin: async (req, res, next) => {
		res.render(path.join(__dirname, '../views/pages/login.ejs'));
	},

	// Attempt a login
	postLogin: async (req, res, next) => {
		const data = req.body;

		if (!verifyDataHasUsernamePassword(data)) {
			return res.render(path.join(__dirname, '../views/pages/login.ejs'), {
				success: false,
				message: 'Username and password required!',
			});
		}

		const user = await UserModel.lookupUser(data.username);

		if (user === null) {
			return res.render(path.join(__dirname, '../views/pages/login.ejs'), {
				success: false,
				message: 'No user found. Maybe you should register?',
			});
		}

		const valid = await UserModel.validatePassword(user, data.password);

		if (valid === false) {
			return res.render(path.join(__dirname, '../views/pages/login.ejs'), {
				success: false,
				message: 'Bad password!',
			});
		}

		req.session.user = user;

		res.redirect('/products');
	},

	// Logout and clear the session
	logout: async (req, res, next) => {
		req.session.user = undefined;

		res.redirect('/users/login');
	},

	// Display the register page
	getRegister: async (req, res, next) => {
		res.render(path.join(__dirname, '../views/pages/register.ejs'));
	},

	// Attemt to register
	postRegister: async (req, res, next) => {
		const data = req.body;

		if (!verifyDataHasUsernamePassword(data)) {
			return res.render(path.join(__dirname, '../views/pages/register.ejs'), {
				success: false,
				message: 'Username and password required!',
			});
		}

		let user = await UserModel.lookupUser(data.username);

		if (user !== null) {
			return res.render(path.join(__dirname, '../views/pages/login.ejs'), {
				success: false,
				message: 'That username is already taken!',
			});
		}

		user = await UserModel.createUser(data.username, data.password);

		res.redirect('/users/login');
	},
};