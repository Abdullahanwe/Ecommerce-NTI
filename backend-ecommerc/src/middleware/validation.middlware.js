import { asyncHandler } from "../utils/response.js";
import { Types } from "mongoose";
import joi from 'joi'
export const generalFields = {
    fullName: joi.string().min(2).max(20).required().messages({
        "string.max": "max fullName length is 20 char",
        "any.required": "fullName is mandatory!!",
        "string.empty": "empty value not allowed"
    }),
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'net'] } }),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
    confirmPassword: joi.string().valid(joi.ref("password")),
    phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    otp: joi.string().length(4).pattern(new RegExp(/^\d{4}$/)),
    id: joi.string().custom((value, helper) => {
        console.log(Types.ObjectId.isValid(value));
        return Types.ObjectId.isValid(value) ? true : helper.message("In-valid mongoDB ID")
    })
}

export const validation = (schema) => {
    return asyncHandler(
        async (req, res, next) => {
            console.log(schema);
            // console.log(Object.keys(schema));
            const validationErrors = []
            for (const key of Object.keys(schema)) {
                console.log(key);
                const validationResult = schema[key].validate(req[key], { abortEarly: false })
                if (validationResult.error) {
                    validationErrors.push({
                        key,
                        details: validationResult.error?.details.map(ele => {
                            return { message: ele.message, path: ele.path[0] }
                        })
                    })
                    // return res.json({ validationResult })
                }
            }
            if (validationErrors.length) {
                return res.status(400).json({ err_message: "Validation error", error: validationErrors })
            }
            return next()
        }
    )
}