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

	addItem: async (req, res, _) => {
		const product = await ProductModel.getProduct(req.params.uuid);

		// If we don't find the product redirect to the products
		if (product === null) {
			return res.redirect('/cart');
		}

		const cart = await CartModel.getUserCart(req.session.user);

		await CartModel.addProductToCart(cart, product);

		res.render(path.join(__dirname, '../views/pages/cart.ejs'), { cart });
	},

	subItem: async (req, res, next) => {
		const product = await ProductModel.getProduct(req.params.uuid);

		// If we don't find the product redirect to the products
		if (product === null) {
		}

		const cart = await CartModel.getUserCart(req.session.user);

		await CartModel.subProductFromCart(cart, product);

		res.render(path.join(__dirname, '../views/pages/cart.ejs'), { cart });
	},

	removeItem: async (req, res, next) => {
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
