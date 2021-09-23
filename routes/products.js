const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/products');

router.get('/', ProductController.getShopPage);
router.get('/addProduct', ProductController.getAddProduct);
router.post('/addProduct', ProductController.postAddProduct);

module.exports = router;
