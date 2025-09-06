import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    name: { type: String, required: true },
    role: { type: String }, 
    message: { type: String, required: true },
    rating: { type: Number, default: 5 }, 
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model("Testimonial", testimonialSchema);
