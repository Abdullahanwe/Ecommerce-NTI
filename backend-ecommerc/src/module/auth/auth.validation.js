import joi from "joi";
import { generalFields } from "../../middleware/validation.middlware.js";

export const signup = {
    body: joi.object().keys({
        fullName: generalFields.fullName.required(),
        email: generalFields.email.required(),
        password: generalFields.password.required(),
        confirmPassword: generalFields.confirmPassword.required(),
        phone: generalFields.phone.required(),
    }).required(),
    query: joi.object().keys({
        lang: joi.string().valid("ar", "en")
    }).required()

}



export const login = {
    body: joi.object().keys({
        email: generalFields.email.required(),
        password: generalFields.password.required()
    }).required()
}

export const confirmEmail = {
    body: joi.object().keys({
        email: generalFields.email.required(),
        otp: generalFields.otp.required()
    }).required()
}
export const signupWithGmail = {
    body: joi.object().keys({
        idToken:joi.string().required()
        
    }).required()
}
export const sendForgotPassword = {
    body: joi.object().keys({
        email:generalFields.email.required()
        
    }).required()
}
export const verifyForgotCode = {
    body: joi.object().keys({
        email:generalFields.email.required(),
        otp:generalFields.otp.required()
        
    }).required()
}
export const resetForgotPassword = {
    body: joi.object().keys({
        email:generalFields.email.required(),
        otp:generalFields.otp.required(),
        password:generalFields.password.required(),
        confirmPassword:generalFields.confirmPassword.required(),
        
    }).required()
}




