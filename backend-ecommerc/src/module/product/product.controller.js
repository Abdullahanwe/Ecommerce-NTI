import { Router } from "express";
import { createProduct, deleteProduct, getAllProduct, getSingleProduct, updateProduct } from "./product.service.js";
import { uploadProjectImage } from "../../middleware/uploadImage.js";

const router = Router();

router.get('/', getAllProduct);
router.get('/:id', getSingleProduct);
router.post('/', uploadProjectImage.single('image'), createProduct);
router.put('/:id', uploadProjectImage.single('image'), updateProduct);
router.delete('/:id', deleteProduct)


    


export default router;