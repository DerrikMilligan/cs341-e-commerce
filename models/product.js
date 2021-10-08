import mongoose from 'mongoose';

export const productSchema = new mongoose.Schema({
  name: String,
  image: String,
  price: Number,
  description: String,
  extended_description: String,
});

export const Product = mongoose.model('Product', productSchema);

const productDefaults = {
  name: 'Generic Name',
  image: 'https://cdn3.iconfinder.com/data/icons/file-and-folder-fill-icons-set/144/File_Search-512.png',
  price: 10.00,
  description: 'I\'m a generic product description!',
  extended_description: 'I\'m a less generic product description!',
};

export default {
  // Return all the products we currently have
  getAllProducts: async () => {
    return await Product.find({});
  },

  // Return a product with a given id
  getProduct: async (id) => {
    const product = await Product.findById(id);

    console.log(`[models][products][getProduct] Looked up product with id: ${id}`);

    return product;
  },

  // Delete a product
  deleteProduct: async (id) => {
    await Product.findByIdAndDelete(id);

    console.log(`[models][products][deleteProduct] Deleted product with id: ${id}`);
  },

  // Add a new product
  addProduct: ({ name, image, price, description, extended_description }) => {
    // Generate a product with the passed data or out defaults
    const newProduct = new Product({
      name: name || productDefaults.name,
      image: image || productDefaults.image,
      price: price || productDefaults.price,
      description: description || productDefaults.description,
      extended_description: extended_description || productDefaults.extended_description,
    });

    newProduct.save();

    console.log(`[models][products][addProduct] Created new product:\n${JSON.stringify(newProduct, null, 2)}`);

    return newProduct;
  },

  // Update an existing product
  updateProduct: async (id, { name, image, price, description, extended_description }) => {
    const product = await Product.findById(id);;

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

    if (description) {
      product.description = description;
      changed = true;
    }

    if (extended_description) {
      product.extended_description = extended_description;
      changed = true;
    }

    if (changed === true) {
      product.save();
    }

    console.log(`[models][products][deleteProduct] Updated product id: ${id}`);

    return product;
  },
};
