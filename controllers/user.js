import path from 'path';

import { UserModel } from '../models/index.js';

import { getDirname } from '../util/index.js';

const __dirname = getDirname();

// From good ol' https://ihateregex.io/expr/email
const emailRegex = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/m;

const verifyEmail = (email) => {
	return (
		email !== undefined &&
		email.trim().length > 0 &&
		emailRegex.test(email)
	);
}

// Just check the data for the username and password
const verifyUserData = (data) => {
	return (
		data.username  !== undefined &&
		data.password  !== undefined &&
		data.password1 !== undefined &&
		data.username .trim().length > 0 &&
		data.password .trim().length > 0 &&
		data.password1.trim().length > 0 &&
		verifyEmail(data.email)
	);
}

export default {
	// Just display the login page
	getLogin: async (_, res) => {
		res.render(path.join(__dirname, '../views/pages/login.ejs'));
	},

	getForgotPassword: async (req, res) => {
		res.render(path.join(__dirname, '../views/pages/forgot_password.ejs'));
	},

	postForgotPassword: async (req, res) => {
		const email = req.body.email;

		if (verifyEmail(email) === false) {
			return res.render(path.join(__dirname, '../views/pages/forgot_password.ejs'), {
				success: false,
				message: 'We need a valid email to reset a password',
			});
		}

		const user = await UserModel.lookupUserByEmail(email);

		if (user === null) {
			return res.render(path.join(__dirname, '../views/pages/forgot_password.ejs'), {
				success: false,
				message: 'There is no user associated with that email.',
			});
		}

		// Send the reset password email
		if (!await UserModel.resetPassword(user)) {
			return res.render(path.join(__dirname, '../views/pages/forgot_password.ejs'), {
				success: false,
				message: 'Failed to send Sendgrid email. Try again later.',
			});
		}

		res.render(path.join(__dirname, '../views/pages/forgot_password.ejs'), {
			success: true,
			message: 'Password reset email sent! You have 30 minutes to use it.',
		});
	},

	getResetPassword: async (req, res) => {
		const hash = req.params.hash;

		// If we don't have a valid hash then we won't be resetting any passwords
		if (hash === undefined || hash === null || hash.length <= 0) {
			return res.render(path.join(__dirname, '../views/pages/login.ejs'), {
				success: false,
				message: 'No reset hash given. Check your email for a link.',
			});
		}

		if (await UserModel.validateResetHash(hash) === false) {
			return res.render(path.join(__dirname, '../views/pages/forgot_password.ejs'), {
				success: false,
				message: 'Invalid link. Please reset your password again.',
			});
		}

		return res.render(path.join(__dirname, '../views/pages/change_password.ejs'), {
			hash,
			success: true,
			message: 'Sweet! Let\'s change your password',
		});
	},

	postChangePassword: async (req, res) => {
		const data = req.body;

		if (data.hash === undefined || data.hash === null || data.hash.length <= 0) {
			return res.render(path.join(__dirname, '../views/pages/forgot_password.ejs'), {
				success: false,
				message: 'You didn\'t have a hash. Are you being naughty?',
			});
		}

		if (
			data.password  === undefined || data.password  === null || data.password .length <= 0 ||
			data.password1 === undefined || data.password1 === null || data.password1.length <= 0
		) {
			return res.render(path.join(__dirname, '../views/pages/change_password.ejs'), {
				hash: data.hash,
				success: false,
				message: 'You need to submit a password and repeat it.',
			});
		}

		if (data.password !== data.password1) {
			return res.render(path.join(__dirname, '../views/pages/change_password.ejs'), {
				hash: data.hash,
				success: false,
				message: 'Passwords don\'t match',
			});
		}

		if (UserModel.changePassword(data.hash, data.password) === false) {
			return res.render(path.join(__dirname, '../views/pages/change_password.ejs'), {
				hash: data.hash,
				success: false,
				message: 'Something went wrong updating password! Try again later.',
			});
		}

		return res.render(path.join(__dirname, '../views/pages/login.ejs'), {
			success: true,
			message: 'Password changed successfully!',
		});
	},

	// Attempt a login
	postLogin: async (req, res) => {
		const data = req.body;

		if (
			data.username === undefined || data.username === null || data.username.length <= 0 ||
			data.password === undefined || data.password === null || data.password.length <= 0
		) {
			return res.render(path.join(__dirname, '../views/pages/login.ejs'), {
				success: false,
				message: 'Username and password required!',
			});
		}

		const user = await UserModel.lookupUser(data.username.trim());

		if (user === null) {
			return res.render(path.join(__dirname, '../views/pages/login.ejs'), {
				success: false,
				message: 'No user found. Maybe you should register?',
			});
		}

		const valid = await UserModel.validatePassword(user, data.password.trim());

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
	logout: async (req, res) => {
		req.session.user = undefined;

		res.redirect('/users/login');
	},

	// Display the register page
	getRegister: async (_, res) => {
		res.render(path.join(__dirname, '../views/pages/register.ejs'));
	},

	// Attemt to register
	postRegister: async (req, res) => {
		const data = req.body;
		
		console.log(`Valid user data: ${verifyUserData(data)}`);

		if (verifyUserData(data) === false) {
			return res.render(path.join(__dirname, '../views/pages/register.ejs'), {
				success: false,
				message: 'Email, username, and password required!',
			});
		}

		if (data.password !== data.password1) {
			return res.render(path.join(__dirname, '../views/pages/register.ejs'), {
				success: false,
				message: 'Passwords must match!',
			});
		}

		let user = await UserModel.lookupUser(data.username.trim());

		if (user !== null) {
			return res.render(path.join(__dirname, '../views/pages/login.ejs'), {
				success: false,
				message: 'That username is already taken!',
			});
		}

		user = await UserModel.createUser({
			email   : data.email.trim(),
			username: data.username.trim(),
			password: data.password.trim(),
		});

		res.redirect('/users/login');
	},


};

