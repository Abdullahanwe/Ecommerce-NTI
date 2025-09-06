import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        require: true,
        trim: true
    },
    price: {
        type: Number,
        require: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Category",
        require: true
    },
    stock: {
        type: Number,
        default: 0
    },
    images: {
        type: String,
    },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date },

}, {
    timestamps: true
})


export const ProductModel = mongoose.model('Product', productSchema);



