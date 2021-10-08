import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const saltRounds = 10;

export const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	is_admin: Boolean,
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

	createUser: async (username, password) => {
		const user = new User({
			username: username,
			password: await bcrypt.hash(password, saltRounds),
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

		return await bcrypt.compare(password, user.password);
	},
};
