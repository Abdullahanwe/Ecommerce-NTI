import { asyncHandler } from "../utils/response.js"

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

        if (!accessRole.includes(req.user.role)) {
            return next(new Error("Not authorized account", { cause: 403 }))
        }
        return next()
    })
}