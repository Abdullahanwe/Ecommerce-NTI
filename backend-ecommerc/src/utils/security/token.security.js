import jwt from 'jsonwebtoken'
import * as DBservice from '../../DB/db.service.js'
import { UserModel } from '../../DB/models/User.model.js'
export const signatureTypeEnum = { system: 'System', bearer: 'Bearer' }
export const tokenTypeEnum = { access: 'access', refresh: 'refresh' }

export const generateToken = async ({ payload = {}, signature = process.env.ACCESS_TOKEN_USER_SIGNATURE, options = { expiresIn: process.env.ACCESS_EXPIRES } } = {}) => {
    return jwt.sign(payload, signature, options)
}
export const verifyToken = async ({ token = "", signature = process.env.ACCESS_TOKEN_USER_SIGNATURE } = {}) => {
    return jwt.verify(token, signature)
}


export const getSignature = async ({ signatureLevel = signatureTypeEnum.bearer } = {}) => {
    let signatures = { accessSignature: undefined, refreshSignature: undefined }

    switch (signatureLevel) {
        case signatureTypeEnum.system:
            signatures.accessSignature = process.env.ACCESS_TOKEN_SYSTEM_SIGNATURE;
            signatures.refreshSignature = process.env.REFRESH_TOKEN_SYSTEM_SIGNATURE;
            break;

        default:
            signatures.accessSignature = process.env.ACCESS_TOKEN_USER_SIGNATURE;
            signatures.refreshSignature = process.env.REFRESH_TOKEN_USER_SIGNATURE;
            break;
    }
    return signatures;
}


export const decodedToken = async ({ authorization = "", tokenType = tokenTypeEnum.access, next } = {}) => {

    const [bearer, token] = authorization?.split(" ") || [];
    console.log({ bearer, token });
    if (!token || !bearer) {
        return next(new Error("Missing Token parts"))
    }
    console.log({ bearer, token });

    const signature = await getSignature({
        signatureLevel: bearer,
        tokenType

    });

    const decoded = await verifyToken({
        token,
        signature: tokenType === tokenTypeEnum.access ? signature.accessSignature : signature.refreshSignature
    })
    console.log(decoded);
    if (!decoded?._id) {
        return next(new Error("In-Valid token", { cause: 400 }))
    }
    const user = await DBservice.findById({ model: UserModel, id: decoded._id })
    if (!user) {
        return next(new Error("Not Register Account", { cause: 404 }))
    }

    return user;

}