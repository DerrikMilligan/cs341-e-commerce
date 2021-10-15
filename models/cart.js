import mongoose from 'mongoose';

export const cartItemSchema = new mongoose.Schema({
	quantity: Number,
	product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
});

export const cartSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	items: [cartItemSchema],
});

export const Cart = mongoose.model('Cart', cartSchema);

export default {
	// Get the cart for a user, populate the items
	getUserCart: async (user) => {
		if (!mongoose.Types.ObjectId.isValid(user._id)) {
			return null;
		}

		let cart = await Cart.findOne({ user: user._id }).populate('items.product').exec();

		if (cart === null) {
			cart = new Cart({ user: user._id });
			await cart.save();
		}

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
	}
};

