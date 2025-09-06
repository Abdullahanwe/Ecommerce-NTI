import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
})


export const categoryModel = mongoose.model('Category', categorySchema);