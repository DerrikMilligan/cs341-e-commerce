const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
	_productFilePath: __dirname + '/../data/products.json',

	_productDefaults: {
		name                : 'Generic Name',
		image               : 'https://cdn3.iconfinder.com/data/icons/file-and-folder-fill-icons-set/144/File_Search-512.png',
		price               : 10.00,
		description         : 'I\'m a generic product description!',
		extended_description: 'I\'m a less generic product description!',
	},

	_readProductFile: function() {
		// Try and read the file and parse the JSON.
		try {
			const products = JSON.parse(fs.readFileSync(this._productFilePath));
			console.log(`[models][products] Loaded ${products.length} prodcuts from the file: '${this._productFilePath}'`);
			return products;
		} catch (e) {
			console.log(`[models][products] Error parsing file: '${this._productFilePath}' Error: '${e}'`);
			return [];
		}
	},

	_writeProductFile: function(products) {
		// Try and write out the products as JSON
		try {
			fs.writeFileSync(this._productFilePath, JSON.stringify(products, null, 2));
			console.log(`[models][products] Saved ${products.length} prodcuts to the file: '${this._productFilePath}'`);
			return true;
		} catch (e) {
			console.log(`[models][products] Error writing to file: '${this._productFilePath}' Error: '${e}'`);
			return false;
		}
	},

	// Return all the products we currently have
	getAllProducts: function() {
		// Return what we have from the file
		return this._readProductFile();
	},

	// Return a product with a given id
	getProduct: function(uuid) {
		// Return what we have from the file
		return this._readProductFile().find((product) => product.id === uuid);
	},

	addProduct: function(product) {
		// This will ensure that we get an object that at least has a value for everything by
		// using the defaults
		const newProduct = Object.assign({}, this._productDefaults, product);

		// Generate an ID for reference later
		newProduct.id = uuidv4();

		// Get the current products
		const products = this._readProductFile();

		// Add the new one
		products.push(newProduct);

		// Write back out the new products array
		const result = this._writeProductFile(products);

		console.log(`[models][products] Added new prodcut:\n${JSON.stringify(newProduct, null, 2)}`);

		return result;
	},
};
