import mongoose from 'mongoose';

export const productSchema = new mongoose.Schema({
	name: String,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	stock: Number,
	image: String,
	price: Number,
	description: String,
});

export const Product = mongoose.model('Product', productSchema);

const productDefaults = {
	name: 'Generic Name',
	image: 'https://cdn3.iconfinder.com/data/icons/file-and-folder-fill-icons-set/144/File_Search-512.png',
	price: 10.00,
	stock: 5,
	description: 'I\'m a product description!',
};

export default {
	// Return all the products we currently have
	getAllProducts: async () => {
		return await Product.find({});
	},

	// Return all products for a given user
	getUserProducts: async (user) => {
		if (user === null || user === undefined) {
			return [];
		}

		if (!mongoose.Types.ObjectId.isValid(user.id)) {
			return null;
		}

		const product = await Product.find({ user: user.id });

		console.log(`[models][products][getProduct] Looked up product for user.id: ${user.id}`);

		return product;
	},

	// Return a product with a given id
	getProduct: async (id) => {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return null;
		}

		const product = await Product.findById(id);

		console.log(`[models][products][getProduct] Looked up product with id: ${id}`);

		return product;
	},

	// Delete a product
	deleteProduct: async (id) => {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return null;
		}

		await Product.findByIdAndDelete(id);

		console.log(`[models][products][deleteProduct] Deleted product with id: ${id}`);
	},

	// Add a new product
	addProduct: (user, { name, image, price, stock, description }) => {
		// Generate a product with the passed data or out defaults
		const newProduct = new Product({
			name:        name        || productDefaults.name,
			image:       image       || productDefaults.image,
			price:       price       || productDefaults.price,
			stock:       stock       || productDefaults.stock,
			description: description || productDefaults.description,
			user:        user        || null,
		});

		newProduct.save();

		console.log(`[models][products][addProduct] Created new product:\n${JSON.stringify(newProduct, null, 2)}`);

		return newProduct;
	},

	// Update an existing product
	updateProduct: async (id, { name, image, price, stock, description }) => {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return null;
		}

		const product = await Product.findById(id);

		let changed = false;

		// Update all the values if they exist
		if (name) {
			product.name = name;
			changed = true;
		}

		if (image) {
			product.image = image;
			changed = true;
		}

		if (price) {
			product.price = price;
			changed = true;
		}

		if (stock) {
			product.stock = stock;
			changed = true;
		}

		if (description) {
			product.description = description;
			changed = true;
		}

		if (changed === true) {
			product.save();
		}

		console.log(`[models][products][deleteProduct] Updated product id: ${id}`);

		return product;
	},
};
