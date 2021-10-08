import path from 'path';

import { ProductModel } from '../models/index.js';

import { getDirname } from '../util/index.js';

const __dirname = getDirname();

export default {
  getShopPage: async (_, res, __) => {
    const products = await ProductModel.getAllProducts();
    console.log(products);
    res.render(path.join(__dirname, '../views/pages/products.ejs'), { products: products });
  },

  getProductDetails: async (req, res, _) => {
    const product = await ProductModel.getProduct(req.params.uuid);
    res.render(path.join(__dirname, '../views/pages/product_details.ejs'), { product: product });
  },

  getAddProduct: (_, res, __) => {
    res.render(path.join(__dirname, '../views/pages/add_product.ejs'));
  },

  editProductDetails: async (req, res, _) => {
    const product = await ProductModel.getProduct(req.params.uuid);

    res.render(path.join(__dirname, '../views/pages/add_product.ejs'), { previousData: product });
  },

  deleteProduct: async (req, res, _) => {
    await ProductModel.deleteProduct(req.params.uuid);

    res.redirect('/products');
  },

  postAddProduct: async (req, res, _) => {
    const postProduct = req.body;

    const response = {
      success: true,
      message: 'Product successfully added!',
      previousData: postProduct,
    };

    let newProduct = false;

    // If we don't have an ID then we're not updating and we should validate and create a new product
    if (postProduct._id === '') {
      if (response.success && (!'name' in postProduct || postProduct.name.trim().length <= 0)) {
        response.success = false;
        response.message = 'A product name is required!';
      }

      if (response.success && (!'description' in postProduct || postProduct.description.trim().length <= 0)) {
        response.success = false;
        response.message = 'A product description is required!';
      }

      if (response.success && (!'extended_description' in postProduct || postProduct.extended_description.trim().length <= 0)) {
        response.success = false;
        response.message = 'An extended product description is required!';
      }

      if (response.success && (!'price' in postProduct || postProduct.price.trim().length <= 0)) {
        response.success = false;
        response.message = 'A product price is required!';
      }

      const product = {
        name: postProduct.name,
        description: postProduct.description,
        extended_description: postProduct.extended_description,
        price: parseFloat(postProduct.price.trim()),
        image: '',
      };

      if (postProduct.image !== undefined && postProduct.image.trim().length > 0) {
        product.image = postProduct.image;
      }

      newProduct = await ProductModel.addProduct(product);

    } else {
      newProduct = await ProductModel.updateProduct(postProduct._id, postProduct);

      response.message = "Product successfully updated!";
    }

    if (response.success && !newProduct) {
      response.success = false;
      response.message = 'Failed to add the product!';
      response.previousData = newProduct;
    }

    res.render(path.join(__dirname, '../views/pages/add_product.ejs'), response);
  },
};

