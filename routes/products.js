import express from 'express';

import { ProductController } from '../controllers/index.js';
import { checkSignIn, userIsAdmin } from './users.js';

const router = express.Router();

router.get('/', checkSignIn, ProductController.getShopPage);
router.get('/addProduct', checkSignIn, ProductController.getAddProduct);
router.post('/addProduct', checkSignIn, ProductController.postAddProduct);
router.get('/:uuid', checkSignIn, ProductController.getProductDetails);
router.get('/:uuid/edit', checkSignIn, ProductController.editProductDetails);
router.get('/:uuid/delete', checkSignIn, ProductController.deleteProduct);

export default router;

