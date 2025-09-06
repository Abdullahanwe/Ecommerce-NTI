import { providerEnum, roleEnum, UserModel } from "../../DB/models/User.model.js"
import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from '../../DB/db.service.js';
import { compareHash, generateHash } from "../../utils/security/hash.security.js";
import { generateEncryption } from "../../utils/security/encrpet.security.js";
import { generateToken, getSignature, signatureTypeEnum, verifyToken } from "../../utils/security/token.security.js";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../../utils/Email/send.email.js";
import { customAlphabet } from 'nanoid';
import { model } from "mongoose";
import { emailEvent } from "../../utils/Events/email.event.js";
import joi from "joi";
import * as authValidation from './auth.validation.js'
import { emailTemplate } from "../../utils/Email/email.templet.js";
// helper service method 
async function verify(idToken) {
    const client = new OAuth2Client(process.env.WEB_CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.WEB_CLIENT_ID,  
    });
    const payload = ticket.getPayload();
    return payload
}


export const generateLoginToken = async ({ user } = {}) => {
    const signature = await getSignature({
        signatureLevel: user.role != roleEnum.user ? signatureTypeEnum.system : signatureTypeEnum.bearer
    })
    const access_token = await generateToken({
        payload: { _id: user._id, role: user.role },
        signature: signature.accessSignature,
        options: {
            expiresIn: 60 * 60
        }
    })
    const refresh_token = await generateToken({
        payload: { _id: user._id },
        signature: signature.refreshSignature,
        options: {
            expiresIn: process.env.REFRESH_EXPIRES
        }
    })
    return { access_token, refresh_token }
}

// system Validation Joi


// System authentication 
export const signup = asyncHandler(
    async (req, res, next) => {
        const { fullName, email, password, phone } = req.body;
        const image = req.file?.filename;

        if (await DBService.findOne({ model: UserModel, filter: { email } })) {
            return next(new Error('Email exist', { cause: 409 }))
        }

        const hashPassword = await generateHash({ plaintext: password })
        const encPhone = await generateEncryption({ plaintext: phone })
        console.log(encPhone);
        // OTP CustomAlphabet <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< 
        const otp = customAlphabet("0123456789", 4)()

        const hashOTP = await generateHash({ plaintext: otp })
        const user = await DBService.create({ model: UserModel, data: [{ fullName, email, image:image, password: hashPassword, phone: encPhone, confirmEmailOTP: hashOTP }] })


        emailEvent.emit('sendConfirmEmail', { to: email, subject: "Confirm-Email", html: await emailTemplate({ otp }) })
        return successResponse({ res, status: 201, data: { user } })
    }
)
export const confirmEmail = asyncHandler(
    async (req, res, next) => {
        const { email, otp } = req.body;
        const user = await DBService.findOne({ model: UserModel, filter: { email, provider: providerEnum.system, confirmEmail: { $exists: false }, confirmEmailOTP: { $exists: true } } })
        if (!user) {
            return next(new Error('In-Valid login data or provider', { cause: 404 }))
        }

        const match = await compareHash({ plaintext: otp, hashValue: user.confirmEmailOTP })
        if (!match) {
            return next(new Error("In-valid OTP", { cause: 400 }))
        }
        const updateUser = await DBService.updateOne({
            model: UserModel,
            filter: { email },
            data: {
                $set: { confirmEmail: Date.now() },
                $unset: {
                    confirmEmailOTP: 1
                }
            }
        }
        )

        return successResponse({ res });
    }
)
export const login = asyncHandler(
    async (req, res, next) => {
        const { email, password } = req.body;
        const user = await DBService.findOne({ model: UserModel, filter: { email, provider: providerEnum.system } })
        if (!user) {
            return next(new Error('In-Valid login data or provider', { cause: 404 }))
        }
        if (!user?.confirmEmail) {
            return next(new Error("Please verify your account first", { cause: 400 }))
        }
        const match = await compareHash({ plaintext: password, hashValue: user.password })
        if (!match) {
            return next(new Error("In-valid login Data", { cause: 404 }))
        }
        const data = await generateLoginToken({ user })
        return successResponse({ res, data })
    }
)

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return next(new Error('Refresh token is required'))
    }
    const decoded = await verifyToken({ token: refresh_token, signature: process.env.REFRESH_TOKEN_USER_SIGNATURE });
    const access_token = await generateToken({
        payload: { _id: decoded._id },
        options: { expiresIn: 60 * 30 }
    })
    return successResponse({ res, data: { access_token } })
})

// Google provider authentication
export const signupWithGmail = asyncHandler(
    async (req, res, next) => {
        const { idToken } = req.body;
        const { email_verified, name, picture, email } = await verify(idToken);
        if (!email_verified) {
            return next(new Error("Email not verified"))
        }
        const user = await DBService.findOne({ model: UserModel, filter: { email } })
        if (user) {
            return next(new Error("Email Exist", { cause: 409 }))
        }

        const newUser = await DBService.create({
            model: UserModel,
            data: [{
                confirmEmail: Date.now(),
                fullName: name,
                email,
                provider: providerEnum.google
            }]
        })

        return successResponse({ res, status: 201, data: { user: newUser } })
    }
)

export const loginWithGmail = asyncHandler(
    async (req, res, next) => {
        const { idToken } = req.body;
        const { email_verified, email } = await verify(idToken);
        if (!email_verified) {
            return next(new Error("Email not verified"))
        }

        const user = await DBService.findOne({
            model: UserModel,
            filter: { email, provider: providerEnum.google }
        })
        if (!user) {
            return next(new Error("In-Valid login data in-valid email or provider"))
        }
        const data = await generateLoginToken(user)
        return successResponse({ res, data: { data } })
    }
)
export const sendForgotPassword = asyncHandler(
    async (req, res, next) => {
        const { email } = req.body;
        const otp = customAlphabet('0123456789', 4)()
        const hashOtp = await generateHash({ plaintext: otp })
        const user = await DBService.findOneAndUpdate({
            model: UserModel,
            filter: {
                email,
                freezeAt: { $exists: false },
                confirmEmail: { $exists: true }
            },
            data: {
                forgotCode: hashOtp
            }
        })
        if (!user) {
            return next(new Error("In-Valid account", { cause: 404 }))
        }
        emailEvent.emit('forgotPassword', { to: email, subject: "Forgot-Password", html: await emailTemplate({ otp, title: "Reset Code" }) })
        return successResponse({ res, data: {} })
    }
)

export const verifyForgotCode = asyncHandler(
    async (req, res, next) => {
        const { email, otp } = req.body;


        const user = await DBService.findOne({
            model: UserModel,
            filter: {
                email,
                freezeAt: { $exists: false },
                confirmEmail: { $exists: true }
            }
        })
        if (!user) {
            return next(new Error("In-Valid account", { cause: 404 }))
        }
        if (!await compareHash({ plaintext: otp, hashValue: user.forgotCode })) {
            return next(new Error("In-Valid otp", { cause: 400 }))
        }
        return successResponse({ res, data: {} })
    }
)
export const resetForgotPassword = asyncHandler(
    async (req, res, next) => {
        const { email, otp } = req.body;


        const user = await DBService.findOne({
            model: UserModel,
            filter: {
                email,
                freezeAt: { $exists: false },
                confirmEmail: { $exists: true }
            }
        })
        if (!user) {
            return next(new Error("In-Valid account", { cause: 404 }))
        }
        if (!await compareHash({ plaintext: otp, hashValue: user.forgotCode })) {
            return next(new Error("In-Valid otp", { cause: 400 }))
        }
        return successResponse({ res, data: {} })
    }
)







// ujrn mcua igwr snud



















