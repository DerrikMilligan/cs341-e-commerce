import express from 'express';

import { UserController } from '../controllers/index.js';

const router = express.Router();

router.get('/login', UserController.getLogin);
router.post('/login', UserController.postLogin);
router.get('/logout', UserController.logout);
router.get('/register', UserController.getRegister);
router.post('/register', UserController.postRegister);

export const checkSignIn = (req, res, next) => {
	if(req.session.user !== null && req.session.user !== undefined) {
		next(); //If session exists, proceed to page
	} else {
		res.redirect('/users/login');
	}
}

export const userIsAdmin = (req, res, next) => {
	if(req.session.user === null || req.session.user === undefined) {
		res.redirect('/users/login');
	} else if (req.session.user.is_admin !== true) {
		res.redirect('/products');
	} else {
		res.redirect('/users/login');
	}
}

export default router;

