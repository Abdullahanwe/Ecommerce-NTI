import { categoryModel } from "../../DB/models/Category.model.js";
import { ProductModel } from "../../DB/models/Product.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";

export const getAllProduct = asyncHandler(
    async (req, res, next) => {
        const products = await ProductModel.find({ isDeleted: false }).populate('categoryId')
        const productsWithImagePath = products.map((product) => {
            return {
                ...product.toObject(),
                categoryName: product.categoryId?.name || 'No Category',
                images: product.images
                    ? `/uploads/products-Image/${product.images}`
                    : null,
            };
        });
        return successResponse({ res, data: productsWithImagePath })
    }
)

export const getSingleProduct = asyncHandler(
    async (req, res, next) => {
        const product = await ProductModel.findById(req.params.id).populate('categoryId');
        if (!product) return next(new Error('Product not found', { statusCode: 404 }));
        return successResponse({ res, data: product });
    }
);









export const createProduct = asyncHandler(async (req, res, next) => {
    const { title, description, price, stock, categoryId } = req.body;
    const image = req.file?.filename;

    // دور على الكاتيجوري بالاسم
    const category = await categoryModel.findById(categoryId );
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }

    // أنشئ المنتج مع ربطه بالكاتيجوري
    const newProduct = await ProductModel.create({
        title,
        description,
        price,
        stock,
        images: image,
        categoryId: category._id, // ربط أوتوماتيك بالكاتيجوري
    });

    return successResponse({
        res,
        data: newProduct,
        message: "Product created successfully",
    });
});


export const updateProduct = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        let updateData = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock
        };
        if (req.file) {
            updateData.images = req.file.filename;
        } else if (req.body.existingImage) {
            updateData.images = req.body.existingImage;
        }
        const updatedProduct = await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedProduct) return next(new Error('Product not found', { statusCode: 404 }));
        return successResponse({ res, data: updatedProduct, message: 'Product updated successfully' });
    }
);


export const deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return next(new Error('Product not found', { statusCode: 404 }));

    product.isDeleted = true; // soft delete
    await product.save();

    return successResponse({ res, message: 'Product deleted (soft)' });
});

