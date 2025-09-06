// routes/testimonial.route.js
import express from "express";
import { auth, authentication, authorization } from "../../middleware/authentication.middleware.js";
import { createTestimonial, getActiveTestimonials, getAllTestimonialsForAdmin, getTestimonialById, hardDeleteTestimonial, softDeleteTestimonial, toggleActiveTestimonial } from "./testimonial.service.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";


const router = express.Router();

router.post("/", authentication(), createTestimonial);

router.get("/admin",auth({ tokenType: tokenTypeEnum.access, accessRole: ["admin"] }),getAllTestimonialsForAdmin);

router.get("/active", getActiveTestimonials);

router.get("/:id", getTestimonialById);

router.patch("/:id/toggle", auth({ tokenType: tokenTypeEnum.access, accessRole: ["admin"] }), toggleActiveTestimonial);

router.delete("/:id/soft", auth({ tokenType: tokenTypeEnum.access, accessRole: ["admin"] }), softDeleteTestimonial);

router.delete("/:id/hard", auth({ tokenType: tokenTypeEnum.access, accessRole: ["admin"] }), hardDeleteTestimonial);

export default router;
