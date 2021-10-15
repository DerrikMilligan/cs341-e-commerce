import express from 'express';

import { CartController } from '../controllers/index.js';
import { isSignedInMiddleware } from '../util/index.js';

const router = express.Router();

// All cart operations require a signed in user
router.get('/', isSignedInMiddleware, CartController.getCart);
router.post('/add/:uuid', isSignedInMiddleware, CartController.addItem);
router.post('/sub/:uuid', isSignedInMiddleware, CartController.subItem);
router.post('/remove/:uuid', isSignedInMiddleware, CartController.removeItem);

export default router;

