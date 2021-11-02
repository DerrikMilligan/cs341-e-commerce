import path from 'path';

import { ProductModel } from '../models/index.js';

import { getDirname } from '../util/index.js';

const __dirname = getDirname();

// This is a small number to represent pagination
const productsPerPage = 6;

export default {
  getShopPage: async (req, res) => {
    let page = 0;
    if (req.params !== undefined && req.params.page !== undefined) {
      page = parseFloat(req.params.page) - 1;
    }
    // Clamp the page at 0 as a minimum since we're offsetting the pages
    page = Math.max(page, 0);

    const currentOffset = page * productsPerPage;

    const products = await ProductModel.getAllProducts(productsPerPage, currentOffset);
    const numProducts = await ProductModel.getProductcount();
    const lastPage = Math.floor(numProducts / productsPerPage) + 1;

    console.log(numProducts);

    res.render(path.join(__dirname, '../views/pages/products.ejs'), {
      page,
      products,
      lastPage,
      nextPage:     ((lastPage - 1) > page),
      previousPage: (currentOffset > 0),
    });
  },

  getProductDetails: async (req, res) => {
    const product = await ProductModel.getProduct(req.params.uuid);
    res.render(path.join(__dirname, '../views/pages/product_details.ejs'), { product: product });
  },

  getAddProduct: (_, res) => {
    res.render(path.join(__dirname, '../views/pages/add_product.ejs'));
  },

  editProductDetails: async (req, res) => {
    const product = await ProductModel.getProduct(req.params.uuid);

    res.render(path.join(__dirname, '../views/pages/add_product.ejs'), { previousData: product });
  },

  deleteProduct: async (req, res) => {
    await ProductModel.deleteProduct(req.params.uuid);

    res.redirect('/products');
  },

  postAddProduct: async (req, res) => {
    const postProduct = req.body;

    const user = (req.session !== undefined && req.session.user !== undefined) ? req.session.user : null;

    if (user === null) {
      res.redirect('/login');
    }

    const response = {
      success: true,
      message: 'Product successfully added!',
      previousData: postProduct,
    };

    let newProduct = null;

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

      if (response.success && (!'price' in postProduct || postProduct.price.trim().length <= 0)) {
        response.success = false;
        response.message = 'A product price is required!';
      }

      if (response.success && (!'stock' in postProduct || postProduct.stock.trim().length <= 0)) {
        response.success = false;
        response.message = 'A product stock is required!';
      }

      const product = {
        name: postProduct.name,
        description: postProduct.description,
        extended_description: postProduct.extended_description,
        price: parseFloat(postProduct.price.trim()),
        stock: parseFloat(postProduct.stock.trim()),
        image: '',
      };

      if (postProduct.image !== undefined && postProduct.image.trim().length > 0) {
        product.image = postProduct.image;
      }

      newProduct = await ProductModel.addProduct(user, product);

    } else {
      newProduct = await ProductModel.updateProduct(postProduct._id, postProduct);

      response.message = "Product successfully updated!";
    }

    if (response.success && newProduct === null) {
      response.success = false;
      response.message = 'Failed to add the product!';
      response.previousData = newProduct;
    }

    if (response.success) {
      return res.redirect(`/products/${newProduct._id}`);
    } else {
      res.render(path.join(__dirname, '../views/pages/add_product.ejs'), response);
    }
  },
};

