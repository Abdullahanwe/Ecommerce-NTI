import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // لو حابب تربطه باليوزر
    name: { type: String, required: true },
    role: { type: String }, // مثال: "Software Engineer"
    message: { type: String, required: true },
    rating: { type: Number, default: 5 }, // اختياري
    isDeleted: { type: Boolean, default: false },// <-- soft delete flag
    isActive: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model("Testimonial", testimonialSchema);
