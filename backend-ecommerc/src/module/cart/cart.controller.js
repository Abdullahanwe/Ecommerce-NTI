import { Router } from "express";
import { addToCart, clearCart, getCart, removeFromCart, updateCartItem } from "./cart.service.js";
import { auth } from "../../middleware/authentication.middleware.js";

const router = Router();

// 🛒 Get cart (user or guest with sessionId)
router.get("/", getCart);
router.get("/:sessionId", getCart);

// 🛒 Add item to cart
router.post("/", addToCart);

// 🛒 Remove item from cart
router.delete("/remove",  removeFromCart);

// ⏳ Update item quantity 
router.patch("/", updateCartItem);

// 🗑️ Clear whole cart
router.delete("/", clearCart);




export default router;