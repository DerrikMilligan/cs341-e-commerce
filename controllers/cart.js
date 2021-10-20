import path from 'path';

import { CartModel, ProductModel } from '../models/index.js';
import { getDirname } from '../util/index.js';

const __dirname = getDirname();

export default {
	getCart: async (req, res, _) => {
		const cart = await CartModel.getUserCart(req.session.user);

		console.log(cart);

		res.render(path.join(__dirname, '../views/pages/cart.ejs'), { cart });
	},

	getOrders: async (req, res) => {
		const orders = await CartModel.getOrders(req.session.user);

		console.log('Current orders: ', orders);

		res.render(path.join(__dirname, '../views/pages/orders.ejs'), { orders });
	},

	getOrderHistory: async (req, res) => {
		const cart = await CartModel.getCart(req.params.uuid);

		res.render(path.join(__dirname, '../views/pages/cart.ejs'), { cart, past_order: true });
	},

	postSubmit: async (req, res) => {
		const cart = await CartModel.getUserCart(req.session.user);

		if (await CartModel.placeOrder(cart) === true) {
			return res.redirect('/cart/orders');
		}

		res.render(path.join(__dirname, '../views/pages/cart.ejs'), {
			cart,
			success: false,
			message: 'Failed to submit your order. Try again later.',
		});
	},

	addItem: async (req, res) => {
		const product = await ProductModel.getProduct(req.params.uuid);

		// If we don't find the product redirect to the products
		if (product === null) {
			return res.redirect('/cart');
		}

		const cart = await CartModel.getUserCart(req.session.user);

		const cartItem = cart.items.find((item) => item.product._id.equals(product._id));

		// If we don't find the product redirect to the products
		if (cartItem && product.stock < cartItem.quantity + 1) {
			return res.render(path.join(__dirname, '../views/pages/cart.ejs'), {
				cart,
				success: false,
				message: 'There\'s no remaining stock for that product',
			});
		}

		await CartModel.addProductToCart(cart, product);

		res.render(path.join(__dirname, '../views/pages/cart.ejs'), { cart });
	},

	subItem: async (req, res) => {
		const product = await ProductModel.getProduct(req.params.uuid);

		// If we don't find the product redirect to the products
		if (product === null) {
		}

		const cart = await CartModel.getUserCart(req.session.user);

		await CartModel.subProductFromCart(cart, product);

		res.render(path.join(__dirname, '../views/pages/cart.ejs'), { cart });
	},

	removeItem: async (req, res) => {
		const product = await ProductModel.getProduct(req.params.uuid);

		// If we don't find the product redirect to the products
		if (product === null) {
			return res.redirect('/cart');
		}

		const cart = await CartModel.getUserCart(req.session.user);

		await CartModel.removeProductFromCart(cart, product);

		res.render(path.join(__dirname, '../views/pages/cart.ejs'), { cart });
	},
};
