import { asyncHandler } from "../utils/response.js"
// import * as DBservice from '../DB/db.service.js'
// import { UserModel } from "../DB/models/User.model.js";
import { decodedToken, tokenTypeEnum } from "../utils/security/token.security.js";
export const authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
    return asyncHandler(async (req, res, next) => {
        const user = await decodedToken({ authorization: req.headers.authorization, next, tokenType })
        req.user = user;
        return next()
    })
}
export const authorization = (accessRole = []) => {
    return asyncHandler(async (req, res, next) => {
        // console.log({ accessRole, role: req.user.role, result: accessRole.includes(req.user.role) });

        if (!accessRole.includes(req.user.role)) {
            return next(new Error('Not authorization account', { cause: 403 }))
        }
        return next()
    })
}

export const auth = ({ tokenType = tokenTypeEnum.access, accessRole = [] } = {}) => {
    return asyncHandler(async (req, res, next) => {
        req.user = await decodedToken({
            authorization: req.headers.authorization,
            next,
            tokenType
        })

        // console.log({ accessRole, role: req.user.role, result: accessRole.includes(req.user.role) });

        // if (accessRole.length > 0 && !accessRole.includes(req.user.role))
        if (!accessRole.includes(req.user.role)) {
            return next(new Error("Not authorized account", { cause: 403 }))
        }
        return next()
    })
}