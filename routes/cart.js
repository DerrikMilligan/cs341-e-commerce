import express from 'express';

import { CartController } from '../controllers/index.js';
import { checkSignIn } from './users.js';

const router = express.Router();

router.get('/', checkSignIn, CartController.getCart);
router.get('/add/:uuid', checkSignIn, CartController.addItem);
router.get('/sub/:uuid', checkSignIn, CartController.subItem);
router.get('/remove/:uuid', checkSignIn, CartController.removeItem);

export default router;
