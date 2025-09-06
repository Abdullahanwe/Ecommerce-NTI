import { Router } from "express";
import { createCategory, deleteCategory, getAllCategory, getProductsByCategoryName, updateCategory } from "./category.service.js";
const router = Router();



router.get('/', getAllCategory)
router.get("/categories/:name", getProductsByCategoryName);
router.post('/', createCategory)
router.patch('/:id', updateCategory)
router.delete('/:id', deleteCategory)







export default router;