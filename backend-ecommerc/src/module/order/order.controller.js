import { Router } from "express";
import { cancelOrder, createOrder, getAllOrders, getOrderById, getOrdersUser, updateOrderStatus } from "./order.service.js";
import { auth, authentication } from "../../middleware/authentication.middleware.js";
const router = Router();



router.get('/', authentication(),getAllOrders)
router.get('/:id',authentication(), getOrderById)
router.get('/user/:id',authentication(), getOrdersUser)
router.put('/:id/status', updateOrderStatus);
router.post('/', authentication(),createOrder)
router.delete('/:id', cancelOrder)







export default router;