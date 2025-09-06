import joi from "joi";
import { generalFields } from "../../middleware/validation.middlware.js";
import { genderEnum } from "../../DB/models/User.model.js";

export const shareProfile = {

    params: joi.object().keys({
        userId: generalFields.id.required()
    }).required()
}


export const updateBasicProfile = {

    body: joi.object().keys({
        firstName: generalFields.fullName.optional(),
        lastName: generalFields.fullName.optional(),
        phone: generalFields.phone,
        gender: joi.string().valid(...Object.values(genderEnum))
    }).required()
}


export const freezeAccount = {

    params: joi.object().keys({
        userId:generalFields.id
    }).required()
}


export const restoreAccount = freezeAccount;

export const updatePassword = {

    body: joi.object().keys({
        oldPassword:generalFields.password.required(),
        password:generalFields.password.not(joi.ref("oldPassword")).required(),
        confirmPassword:generalFields.confirmPassword.required()
    }).required()
}



