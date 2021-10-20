import mongoose from 'mongoose';

export const cartItemSchema = new mongoose.Schema({
	quantity: Number,
	product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
});

export const cartSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	items: [ cartItemSchema ],
	order_timestamp: Date,
	order_placed: { type: Boolean, default: false },
});

export const Cart = mongoose.model('Cart', cartSchema);

export default {
	// Get the cart for a user, populate the items
	getUserCart: async (user) => {
		if (!mongoose.Types.ObjectId.isValid(user._id)) {
			return null;
		}

		// Attempt to find a cart whose order hasn't been placed
		let cart = await Cart.findOne({ user: user._id, order_placed: false }).populate('items.product').exec();

		if (cart === null) {
			cart = new Cart({ user: user._id });
			await cart.save();
		}

		return cart;
	},

	getCart: async (id) => {
		// Attempt to find a cart whose order hasn't been placed
		let cart = await Cart.findOne({ _id: id }).populate('items.product').exec();

		return cart;
	},

	addProductToCart: async (cart, product) => {
		const cartItem = cart.items.find((item) => item.product._id.equals(product._id));

		// If we don't have a cart item yet, add one with the quantity
		if (cartItem === undefined) {
			cart.items.push({ quantity: 1, product });
		} else {
			cartItem.quantity++;
		}

		await cart.save();
	},

	subProductFromCart: async (cart, product) => {
		const cartItem = cart.items.find((item) => item.product._id.equals(product._id));

		// If we don't have a cart item yet, add one with the quantity
		if (cartItem !== undefined) {
			cartItem.quantity--

			if (cartItem.quantity <= 0) {
				const cartItemIndex = cart.items.indexOf(cartItem);
				cart.items.splice(cartItemIndex, 1);
			}

			await cart.save();
		}
	},

	removeProductFromCart: async (cart, product) => {
		const cartItem = cart.items.find((item) => item.product._id.equals(product._id));

		// If we don't have a cart item yet, add one with the quantity
		if (cartItem !== undefined) {
			const cartItemIndex = cart.items.indexOf(cartItem);
			cart.items.splice(cartItemIndex, 1);
			await cart.save();
		}
	},

	getOrders: async (user) => {
		if (!mongoose.Types.ObjectId.isValid(user._id)) {
			return [];
		}

		const orders = Cart.find({ user: user._id, order_placed: true }).populate('items.product').exec();

		if (orders === null) {
			return [];
		}

		return orders;
	},

	placeOrder: async (cart) => {
		if (!mongoose.Types.ObjectId.isValid(cart._id)) {
			return false;
		}

		cart.order_placed = true;
		cart.order_timestamp = Date.now();

		try {
			await cart.save();
			return true;
		} catch (error) {
			return false;
		}
	},
};

