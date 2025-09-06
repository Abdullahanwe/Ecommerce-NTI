export const asyncHandler = (fn) => {
    return async (req, res, next) => {
        await fn(req, res, next).catch(error => {
            return next({ error, message: error.message, stack: error.stack }, { cause: 500 })
        })
    }

}

export const successResponse = ({ res, message = "Done", status = 200, data = {} } = {}) => {
    return res.status(status).json({ message, data })
}

export const globalErrorHandling = (error, req, res, next) => {
    return res.status(error.cause || 400).json({ message: error.message, stack: error.stack })
}