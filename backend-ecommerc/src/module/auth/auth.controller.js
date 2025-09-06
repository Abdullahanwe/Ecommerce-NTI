import { validation } from '../../middleware/validation.middlware.js';
import * as authService from './auth.service.js'
import { Router } from 'express';
import * as authValidation from './auth.validation.js'
import { uploadProjectImage } from '../../middleware/uploadImage.js';

const router = Router();

router.post('/signup', validation(authValidation.signup), uploadProjectImage.single('image'), authService.signup)
router.post('/signup/gmail',validation(authValidation.signupWithGmail), authService.signupWithGmail)
router.post('/login',validation(authValidation.login), authService.login)
router.patch('/confirm-email',validation(authValidation.confirmEmail), authService.confirmEmail)
router.post('/login/gmail',validation(authValidation.signupWithGmail), authService.loginWithGmail)
router.post('/refresh-token', authService.refreshAccessToken)

router.patch("/send-forgot-password" ,validation(authValidation.sendForgotPassword), authService.sendForgotPassword)
router.patch("/verify-forgot-password" ,validation(authValidation.verifyForgotCode), authService.verifyForgotCode)
router.patch("/reset-forgot-password" ,validation(authValidation.resetForgotPassword), authService.resetForgotPassword)

export default router;