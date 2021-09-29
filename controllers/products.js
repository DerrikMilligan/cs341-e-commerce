const Products = require('../models/products');

module.exports = {
	getShopPage: (req, res, next) => {
		const products = Products.getAllProducts();
		res.render('../views/pages/products.ejs', { products: products });
	},

	getProductDetails: (req, res, next) => {
		const product = Products.getProduct(req.params.uuid);
		res.render('../views/pages/product_details.ejs', { product: product });
	},

	getAddProduct: (req, res, next) => {
		res.render('../views/pages/add_product.ejs');
	},

	postAddProduct: (req, res, next) => {
		const postProduct = req.body;

		const response = {
			success: true,
			message: 'Product successfully added!',
		};

		if (response.success && (!'product_name' in postProduct || postProduct.product_name.trim().length <= 0)) {
			response.success      = false;
			response.message      = 'A product name is required!';
			response.previousData = postProduct;
		}

		if (response.success && (!'product_description' in postProduct || postProduct.product_description.trim().length <= 0)) {
			response.success      = false;
			response.message      = 'A product description is required!';
			response.previousData = postProduct;
		}

		if (response.success && (!'product_extended_description' in postProduct || postProduct.product_extended_description.trim().length <= 0)) {
			response.success      = false;
			response.message      = 'An extended product description is required!';
			response.previousData = postProduct;
		}

		if (response.success && (!'product_price' in postProduct || postProduct.product_price.trim().length <= 0)) {
			response.success      = false;
			response.message      = 'A product price is required!';
			response.previousData = postProduct;
		}

		const product = {
			name                : postProduct.product_name,
			description         : postProduct.product_description,
			extended_description: postProduct.product_extended_description,
			price               : parseFloat(postProduct.product_price.trim()),
		};

		if (postProduct.product_image_url !== undefined && postProduct.product_image_url.trim().length > 0) {
			product.image = postProduct.product_image_url;
		}

		if (response.success && !Products.addProduct(product)) {
			response.success      = false;
			response.message      = 'Failed to add the product!';
			response.previousData = postProduct;
		}

		res.render('../views/pages/add_product.ejs', response);
	},
};

