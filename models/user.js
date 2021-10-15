import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import sendgrid from '@sendgrid/mail';
import { v4 as uuid } from 'uuid';

const saltRounds = 10;
const hashTTL = 30 * 60 * 1000; // 30 mintues
const baseUrl = 'https://nameless-beyond-44302.herokuapp.com';

export const userSchema = new mongoose.Schema({
	email:         String,
	username:      String,
	password:      String,
	resetHash:     String,
	hashTimestamp: Number,
	is_admin:      Boolean,
});

export const User = mongoose.model('User', userSchema);

export default {
	getUser: async (id) => {
		return await User.findById(id).exec();
	},

	// Check to see if a username is taken
	lookupUser: async (username) => {
		return await User.findOne({ username }).exec();
	},

	lookupUserByEmail: async (email) => {
		return await User.findOne({ email }).exec();
	},

	createUser: async ({ email, username, password }) => {
		const user = new User({
			email,
			username,
			// Hash the password we store
			password: await bcrypt.hash(password, saltRounds),
			resetHash: '',
			hashTimestamp: 0,
			is_admin: false,
		});

		await user.save();

		return user;
	},

	validatePassword: async (user, password) => {
		// If the user doesn't exist return false
		if (user === null) {
			return false;
		}

		console.log(`[Model][User][validatePassword] Testing ${user.username}'s password against: '${password}'`);

		return await bcrypt.compare(password, user.password);
	},

	validateResetHash: async (resetHash) => {
		console.log(`[models][user][validateResetHash] Looking up hash: ${resetHash}`);

		const user = await User.findOne({ resetHash }).exec();

		console.log(`[models][user][validateResetHash] User found: ${JSON.stringify(user, null, 2)}`);

		// If there's no hash found then we don't have a valid one
		if (user === null) {
			return false;
		}

		console.log(`[models][user][validateResetHash] Timestamp difference: ${Date.now() - user.hashTimestamp} TTL: ${hashTTL}`);

		// If the hash timestamp is older than thirty minutes then we've failed
		if (Date.now() - user.hashTimestamp > hashTTL) {
			return false;
		}

		return true;
	},

	changePassword: async (resetHash, password) => {
		const user = await User.findOne({ resetHash }).exec();

		// If there's no hash found then we don't have a valid one
		if (user === null) {
			return false;
		}

		// Update the password. Make sure to hash it!
		user.password = await bcrypt.hash(password, saltRounds);

		// Probably a good idea to invalidate the hash after a successful update
		user.hashTimestamp = 0;

		await user.save();

		return true;
	},

	resetPassword: async (user) => {
		// If the user doesn't exist return false
		if (user === null) {
			return false;
		}

		// Generate a reset hash and a timestamp as they're only good for 30 minutes
		user.resetHash = uuid();
		user.hashTimestamp = Date.now();

		console.log(`[Model][User][resetPassword] Generated reset hash: '${user.resetHash}' for user: ${user.username}`);

		await user.save();

		const sendgridEmail = {
			to: user.email,
			from: 'derrik.milligan.dev@gmail.com',
			subject: 'Derrik\'s CS316 Password Reset',
			text:
				`Hey there ${user.username}!\n\n` +
				`Someone requested to reset your password. If this wasn't you then just ignore this email.\n\n` +
				`But if this was you, here's your link to reset: ${baseUrl}/users/reset/${user.resetHash}\n\n` +
				`This link will be valid for 30 minutes to reset your password.\n\n` +
				`Thanks for demoing the site!`,
		};

		try {
			await sendgrid.send(sendgridEmail);
		} catch (e) {
			console.log(`[Model][User][resetPassword] Failed to send email through sendgrid!\nEmail Data: ${JSON.stringify(sendgridEmail, null, 2)}\nError: ${e}`);
			return false;
		}

		return true;
	},
};

