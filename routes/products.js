import express from 'express';

import { ProductController } from '../controllers/index.js';
import { isAdminMiddleware } from '../util/index.js';

const router = express.Router();

// The CRUD operations require being an admin
router.get('/addProduct', isAdminMiddleware, ProductController.getAddProduct);
router.post('/addProduct', isAdminMiddleware, ProductController.postAddProduct);
router.post('/:uuid/edit', isAdminMiddleware, ProductController.editProductDetails);
router.post('/:uuid/delete', isAdminMiddleware, ProductController.deleteProduct);

// This main product page and viewing products will be allowed for viewing without being logged in
router.get('/', ProductController.getShopPage);
router.get('/page/:page', ProductController.getShopPage);
router.get('/:uuid', ProductController.getProductDetails);

export default router;

