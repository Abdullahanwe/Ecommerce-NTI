import { categoryModel } from "../../DB/models/Category.model.js";
import { ProductModel } from "../../DB/models/Product.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";


export const getAllCategory = asyncHandler(async (req, res, next) => {
    const categories = await categoryModel.find().lean();

    const categoriesWithStats = await Promise.all(
        categories.map(async (cat) => {
            const product = await ProductModel.findOne({ categoryId: cat._id })
                .select("images")
                .lean();
            const count = await ProductModel.countDocuments({ categoryId: cat._id });
            const imagePath = product?.images
                ? `/uploads/products-Image/${product.images}`
                : null;
            return {
                ...cat,
                productsCount: count,
                image: imagePath,
            };
        })
    );

    return successResponse({ res, data: categoriesWithStats });
});

export const getProductsByCategoryName = asyncHandler(async (req, res, next) => {
    const { name } = req.params;


    const category = await categoryModel.findOne({ name }).lean();
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }


    const products = await ProductModel.find({ categoryId: category._id })
        .select("name description price images createdAt")
        .lean();

   
    return successResponse({
        res,
        data: {
            category: {
                _id: category._id,
                name: category.name,
            },
            products,
        },
    });
});



export const createCategory = asyncHandler(
    async (req, res, next) => {
        const { name, description } = req.body
        const image = req.file?.filename;
        const create = await categoryModel.create({ name, description, image })
        return successResponse({ res, data: create })
    }
)



export const updateCategory = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params;
        let updateData = {
            name: req.body.name
        };
        const updatedProduct = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedProduct) return next(new Error('Category not found', { statusCode: 404 }));
        return successResponse({ res, data: updatedProduct, message: 'Category updated successfully' });
    }
)


export const deleteCategory = asyncHandler(
    async (req, res, next) => {
        const deletedCategory = await categoryModel.findByIdAndDelete(req.params.id);
        if (!deletedCategory) return next(new Error('Category not found', { statusCode: 404 }));
        return successResponse({ res, message: 'Category deleted successfully' });
    }
);