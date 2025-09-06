// import mongoose from "mongoose";

// const cartSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//         unique: true
//     },
//     items: [
//         {
//             product: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "Product",
//                 required: true
//             },
//             price: {
//                 type: Number,
//                 required: true
//             },
//             quantity: {
//                 type: Number,
//                 required: true,
//                 min: 1,
//                 default: 1
//             }
//         }
//     ],
//     totalItems: {
//         type: Number,
//         default: 0
//     },
//     totalPrice: {
//         type: Number,
//         default: 0
//     },
//     status: {
//         type: String,
//         enum: ["active", "ordered"],
//         default: "active"
//     }
// }, { timestamps: true });

// export const CartModel = mongoose.model("Cart", cartSchema);

import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true } // snapshot للسعر
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String }, // للضيوف
    items: [cartItemSchema],
    totalItems: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);

