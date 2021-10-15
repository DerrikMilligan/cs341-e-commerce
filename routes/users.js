import express from 'express';

import { UserController } from '../controllers/index.js';

const router = express.Router();

// None of the account operations require being logged in currently
router.get('/login', UserController.getLogin);
router.post('/login', UserController.postLogin);
router.get('/logout', UserController.logout);
router.get('/register', UserController.getRegister);
router.post('/register', UserController.postRegister);
router.get('/forgotPassword', UserController.getForgotPassword);
router.post('/forgotPassword', UserController.postForgotPassword);
router.post('/changePassword', UserController.postChangePassword);
router.get('/reset/:hash', UserController.getResetPassword);

export default router;

