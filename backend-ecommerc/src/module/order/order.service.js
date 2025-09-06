import CartModel from "../../DB/models/Cart.js";
import OrderModel from "../../DB/models/Order.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";

export const createOrder = asyncHandler(async (req, res) => {
    const { sessionId, paymentMethod } = req.body;
    const user = req.user || null; // جاي من JWT

    console.log({ userID: user?._id });
    console.log("sessionId from req.body:", sessionId);

    let cart = null;

    if (user?._id) {
        // 🔹 الأول شوف هل عنده cart كـ user
        let userCart = await CartModel.findOne({ user: user._id }).populate("items.product");

        // 🔹 شوف كارت الضيف (لو كان عنده sessionId)
        let guestCart = null;
        if (sessionId) {
            guestCart = await CartModel.findOne({ sessionId }).populate("items.product");
        }

        if (userCart && guestCart) {
            // 🟢 دمج الكروت: ضيف items بتاعة الضيف على بتاعة اليوزر
            guestCart.items.forEach((item) => {
                const existingItem = userCart.items.find(
                    (i) => i.product._id.toString() === item.product._id.toString()
                );
                if (existingItem) {
                    existingItem.quantity += item.quantity; // زود الكمية
                } else {
                    userCart.items.push(item);
                }
            });

            // تحديث totalPrice
            userCart.totalPrice += guestCart.totalPrice;

            // خزّن التغييرات
            await userCart.save();

            // احذف cart بتاع الضيف
            await CartModel.deleteOne({ _id: guestCart._id });

            cart = userCart;
        } else if (guestCart && !userCart) {
            // 🟢 لو مفيش كارت لليوزر لكن فيه كارت guest → اربطه باليوزر
            guestCart.user = user._id;
            guestCart.sessionId = null;
            await guestCart.save();
            cart = guestCart;
        } else if (userCart) {
            cart = userCart;
        }
    } else if (sessionId) {
        // 🟢 لو ضيف عادي
        cart = await CartModel.findOne({ sessionId }).populate("items.product");
    }

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Cart is empty",
        });
    }

    // 🟢 إنشاء order
    const order = await OrderModel.create({
        user: user?._id || null,
        sessionId: user ? null : sessionId,
        items: cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price,
        })),
        totalPrice: cart.totalPrice,
        paymentMethod: paymentMethod || "cash",
    });

    console.log(order);

    // 🟢 امسح الكارت بعد تحويله لأوردر
    await CartModel.deleteOne({ _id: cart._id });

    return successResponse({
        res,
        status: 201,
        message: "Order created successfully",
        data: order,
    });

});


export const getAllOrders = asyncHandler(
    async (req, res) => { // صححت الترتيب
        const orders = await OrderModel.find().populate("items.product").populate("user", "email role fullName firstName lastName");
        return successResponse({ res, status: 200, data: orders }); // تمرير res صحيح
    }
)



// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id).populate("items.product").populate("user", "email role fullName firstName lastName");
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getOrdersUser = asyncHandler(
    async (req, res) => {
        const orders = await OrderModel.find({ user: req.user._id }).populate("items.product").populate("user", "email role fullName firstName lastName")
        return successResponse({ res, status: 200, data: orders })
    }
)


export const updateOrderStatus = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    // تحقق من صحة الحالة
    if (!['pending', 'completed', 'canceled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await OrderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });
    return successResponse({res , message:'Order status updated' , data:order})
})


// Cancel order
export const cancelOrder = async (req, res) => {
    try {
        const order = await OrderModel.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Order canceled successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
