import TestimonialModel from "../../DB/models/testimonial.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";


export const createTestimonial = asyncHandler(async (req, res) => {
    const { name, role, message, rating } = req.body;

    if (!name || !message) {
        return res.status(400).json({ success: false, message: "Name and message are required" });
    }

    const testimonial = await TestimonialModel.create({ name, role, message, rating });

    return successResponse({
        res,
        status: 201,
        message: "Testimonial created successfully",
        data: testimonial,
    });
});


export const getAllTestimonialsForAdmin = asyncHandler(async (req, res) => {
    console.log(req);
    
    const testimonials = await TestimonialModel.find();
    return successResponse({
        res,
        message: "All testimonials retrieved (admin view)",
        data: testimonials,
    });
});


export const getActiveTestimonials = asyncHandler(async (req, res) => {
    const testimonials = await TestimonialModel.find({ isDeleted: false, isActive: true });
    return successResponse({
        res,
        message: "Active testimonials retrieved successfully",
        data: testimonials,
    });
});


export const getTestimonialById = asyncHandler(async (req, res) => {
    const testimonial = await TestimonialModel.findById(req.params.id);
    if (!testimonial) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    return successResponse({ res, status: 200, data: testimonial });
});


export const toggleActiveTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body; // true أو false

    const testimonial = await TestimonialModel.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
    );

    if (!testimonial) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    return successResponse({
        res,
        message: `Testimonial ${isActive ? "activated" : "deactivated"} successfully`,
        data: testimonial,
    });
});


export const softDeleteTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const testimonial = await TestimonialModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
    );

    if (!testimonial) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    return successResponse({
        res,
        message: "Testimonial soft deleted successfully",
        data: testimonial,
    });
});


export const hardDeleteTestimonial = asyncHandler(async (req, res) => {
    const testimonial = await TestimonialModel.findByIdAndDelete(req.params.id);
    if (!testimonial) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    return successResponse({
        res,
        message: "Testimonial permanently deleted successfully",
    });
});
