import CartModel from "../../DB/models/Cart.js";
import { ProductModel } from "../../DB/models/Product.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import { decodedToken } from "../../utils/security/token.security.js";



// ✅ Add to Cart
// export const addToCart = asyncHandler(async (req, res, next) => {
//     const { productId, quantity = 1, sessionId } = req.body;

//     // Check product
//     const product = await ProductModel.findById(productId);
//     if (!product) return next(new Error("Product not found", { cause: 404 }));

//     // Decide filter (user or sessionId)
//     let filter = {};
//     if (req.user?._id) {
//         filter.user = req.user._id;
//     } else {
//         if (!sessionId) return next(new Error("sessionId required for guest cart", { cause: 400 }));
//         filter.sessionId = sessionId;
//     }

//     let cart = await CartModel.findOne(filter);

//     if (!cart) {
//         cart = new CartModel({
//             ...filter,
//             items: [{ product: productId, price: product.price, quantity }],
//             totalItems: quantity,
//             totalPrice: product.price * quantity
//         });
//     } else {
//         const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
//         if (itemIndex > -1) {
//             cart.items[itemIndex].quantity += quantity;
//         } else {
//             cart.items.push({ product: productId, price: product.price, quantity });
//         }

//         cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
//         cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
//     }

//     await cart.save();
//     return successResponse({ res, data: cart, message: "Item added to cart" });
// });




// ✅ Get Cart
export const getCart = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.query;

    let filter = {};
    if (req.user?._id) {
        filter.user = req.user._id;
    } else {
        if (!sessionId) return next(new Error("sessionId required for guest cart", { cause: 400 }));
        filter.sessionId = sessionId;
    }

    const cart = await CartModel.findOne(filter).populate("items.product");
    if (!cart) return next(new Error("Cart not found", { cause: 404 }));

    return successResponse({ res, data: cart });
});


// ✅ Add multiple products to Cart
export const addToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity = 1, sessionId } = req.body;
    console.log({ productId, quantity, sessionId });

    // التحقق من المنتج
    const product = await ProductModel.findById(productId);
    console.log(product);

    if (!product) return next(new Error("Product not found", { cause: 404 }));

    // فلترة حسب اليوزر أو sessionId
    let filter = {};
    if (req.user?._id) {
        filter.user = req.user._id;
    } else {
        if (!sessionId) return next(new Error("sessionId required for guest cart", { cause: 400 }));
        filter.sessionId = sessionId;
    }

    let cart = await CartModel.findOne(filter);

    if (!cart) {
        // إنشاء كارت جديد
        cart = new CartModel({
            ...filter,
            items: [{ product: productId, price: product.price, quantity }],
            totalItems: quantity,
            totalPrice: product.price * quantity
        });
    } else {
        // إضافة أو تحديث المنتج داخل الكارت
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, price: product.price, quantity });
        }

        cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }

    await cart.save();
    return successResponse({ res, data: cart, message: "Item added to cart" });
});


// ✅ Remove Item
export const removeFromCart = asyncHandler(async (req, res, next) => {
    const { productId, sessionId } = req.body;

    let filter = {};
    if (req.user?._id) {
        filter.user = req.user._id;
    } else {
        if (!sessionId) return next(new Error("sessionId required for guest cart", { cause: 400 }));
        filter.sessionId = sessionId;
    }

    let cart = await CartModel.findOne(filter).populate('items.product');
    if (!cart) return next(new Error("Cart not found", { cause: 404 }));

    cart.items = cart.items.filter(item => {
        const id = item.product._id ? item.product._id.toString() : item.product.toString();
        return id !== productId;
    });

    cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    await cart.save();
    return successResponse({ res, data: cart, message: "Item removed from cart" });
});
// ✅ Update Item Quantity
export const updateCartItem = asyncHandler(async (req, res, next) => {
    const { productId, quantity, sessionId } = req.body;

    if (quantity <= 0) return next(new Error("Quantity must be greater than 0", { cause: 400 }));

    let filter = {};
    if (req.user?._id) {
        filter.user = req.user._id;
    } else {
        if (!sessionId) return next(new Error("sessionId required for guest cart", { cause: 400 }));
        filter.sessionId = sessionId;
    }

    let cart = await CartModel.findOne(filter).populate('items.product');
    if (!cart) return next(new Error("Cart not found", { cause: 404 }));

    const itemIndex = cart.items.findIndex(item => {
        // ✅ يدعم الحالتين: populated أو ObjectId
        const productIdInCart = item.product._id ? item.product._id.toString() : item.product.toString();
        return productIdInCart === productId;
    });
    if (itemIndex === -1) return next(new Error("Item not found in cart", { cause: 404 }));

    cart.items[itemIndex].quantity = quantity;

    cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    await cart.save();
    return successResponse({ res, data: cart, message: "Cart updated successfully" });
});


// ✅ Clear Cart
export const clearCart = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.body;

    let filter = {};
    if (req.user?._id) {
        filter.user = req.user._id;
    } else {
        if (!sessionId) return next(new Error("sessionId required for guest cart", { cause: 400 }));
        filter.sessionId = sessionId;
    }

    let cart = await CartModel.findOne(filter);
    if (!cart) return next(new Error("Cart not found", { cause: 404 }));

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();
    return successResponse({ res, data: cart, message: "Cart cleared successfully" });
});
