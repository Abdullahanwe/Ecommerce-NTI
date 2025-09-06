import { asyncHandler, successResponse } from "../../utils/response.js";
import { decryptEncryption, generateEncryption } from "../../utils/security/encrpet.security.js";
import { generateLoginToken } from "../auth/auth.service.js";
import * as DBService from '../../DB/db.service.js'
import { roleEnum, UserModel } from "../../DB/models/User.model.js";
import { compareHash, generateHash } from "../../utils/security/hash.security.js";
export const profile = asyncHandler(async (req, res, next) => {
    req.user.phone = await decryptEncryption({ cipherText: req.user.phone })
    console.log(req.user.phone);

    return successResponse({ res, data: { user: req.user } })
})


export const shareProfile = asyncHandler(
    async (req, res, next) => {
        const { userId } = req.params;
        const user = await DBService.findOne({
            model: UserModel,
            filter: { _id: userId },
            select: "-password -role"
        })
        return user ? successResponse({ res, data: { user } })
            : next(new Error("Not register account", { cause: 404 }))
    }
)
export const updateBasicProfile = asyncHandler(
    async (req, res, next) => {

        if (req.body.phone) {
            req.body.phone = await generateEncryption({ plaintext: req.body.phone })
        }
        const user = await DBService.findOneAndUpdate({
            model: UserModel,
            filter: { _id: req.user._id },
            data: {
                $set: req.body,
                $inc: { __v: 1 }
            }
        })
        return user ? successResponse({ res, data: { user } })
            : next(new Error("Not register account", { cause: 404 }))
    }
)
export const freezeAccount = asyncHandler(
    async (req, res, next) => {

        const { userId } = req.params;

        if (userId && req.user.role !== roleEnum.admin) {
            return next(new Error("regular users cannot freeze other users accounts", { cause: 403 }))
        }

        const user = await DBService.updateOne({
            model: UserModel,
            filter: {
                _id: userId || req.user._id,
                freezedAt: { $exists: false }
            },
            data: {
                $set: {
                    freezedAt: Date.now(),
                    freezedBy: req.user._id
                },
                $inc: { __v: 1 }
            }
        })
        return user.matchedCount ? successResponse({ res, data: { user } })
            : next(new Error("Not register account", { cause: 404 }))
    }
)
export const restoreAccount = asyncHandler(
    async (req, res, next) => {

        const { userId } = req.params;

        if (userId && req.user.role !== roleEnum.admin) {
            return next(new Error("regular users cannot restore other users accounts", { cause: 403 }))
        }

        const user = await DBService.updateOne({
            model: UserModel,
            filter: {
                _id: userId || req.user._id,
                freezedAt: { $exists: true }
            },
            data: {
                $set: {

                    restoredBy: req.user._id
                },
                $unset: {
                    freezedAt: 1,
                    freezedBy: 1,
                },
                $inc: { __v: 1 }
            }
        })
        return user.matchedCount ? successResponse({ res, data: { user } })
            : next(new Error("Not register account", { cause: 404 }))
    }
)
export const hardDelete = asyncHandler(
    async (req, res, next) => {

        const { userId } = req.params;

        if (userId && req.user.role !== roleEnum.admin) {
            return next(new Error("regular users cannot deleted other users accounts", { cause: 403 }))
        }

        const user = await DBService.deleteOne({
            model: UserModel,
            filter: {
                _id: userId || req.user._id,
                freezedAt: { $exists: true }
            }

        })
        return user.deletedCount ? successResponse({ res, data: { user } })
            : next(new Error("Not register account", { cause: 404 }))
    }
)
export const updatePassword = asyncHandler(
    async (req, res, next) => {

        const { oldPassword, password } = req.body;
        if (!await compareHash({ plaintext: oldPassword, hashValue: req.user.password })) {
            return next(new Error("In-Valid old password"))
        }
        // لو عايز اعرف انت مسجل الباسورد الجديد دا قبل كداا ولا لاه 
        // for (const hash of req.user.oldPassword || []) {   
        //     if (await compareHash({ plaintext: oldPassword, hashValue: hash })) {
        //         return next(new Error("user Have used this password before"))
        //     }
        // }
        const hashPassword = await generateHash({ plaintext: password })
        const user = await DBService.updateOne({
            model: UserModel,
            filter: { _id: req.user._id },
            data: {
                $set: { password: hashPassword },
                $push: { oldPassword: req.user.password },
                $inc: { __v: 1 },
            }
        })
        return user.matchedCount ? successResponse({ res, data: { user } })
            : next(new Error("Not register account", { cause: 404 }))
    }
)


export const getNewToken = asyncHandler(
    async (req, res, next) => {
        const token = await generateLoginToken({ user: req.user })

        return successResponse({ res, data: { token } })

    }
)  