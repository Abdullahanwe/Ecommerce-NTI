
import mongoose, { Schema } from "mongoose";


export let genderEnum = { male: 'male', female: 'female' }
export let roleEnum = { user: 'user', admin: 'admin' }
export let providerEnum = { system: 'system', google: 'google' }


const userSchema = new Schema({
    firstName: {
        type: String, required: true, minLength: 2,
        maxLength: [20, 'firstName max length is 20 char and you have entered {VALUE} ']
    },
    lastName: {
        type: String, required: true, minLength: 2,
        maxLength: [20, 'firstName max length is 20 char and you have entered {VALUE} ']
    },
    email: {
        type: String, required: true, unique: true
    },
    password: {
        type: String, required: function () {
            return this.provider === providerEnum.system ? true : false;
        }
    },
    oldPassword: {
        type: [String],
    },
    gender: {
        type: String,
        enum: { values: Object.values(genderEnum), message: `gender only allow ${Object.values(genderEnum)}` },
        default: genderEnum.male
    },
    provider: {
        type: String,
        enum: Object.values(providerEnum),
        default: providerEnum.system
    },
    forgotCode: String,
    role: {
        type: String,
        enum: { values: Object.values(roleEnum), message: `role only allow ${Object.values(roleEnum)}` },
        default: roleEnum.user
    },
    phone: String,
    freezedAt: Date,
    freezedBy: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    },
    restoredBy: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    },
    confirmEmail: Date,
    confirmEmailOTP: {
        type: String,
        required: function () {
            return this.provider === providerEnum.system ? true : false;
        }
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    images: {
        type: String,
    },

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

userSchema.virtual('fullName').set(function (v) {
    const [firstName, lastName] = v?.split(" ") || [];
    this.set({ firstName, lastName })
}).get(function () {
    return this.firstName + " " + this.lastName;
})

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

UserModel.syncIndexes()