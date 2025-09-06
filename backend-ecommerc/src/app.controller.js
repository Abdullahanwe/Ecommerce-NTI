import express, { json } from "express"
import connectDB from "./DB/connection.db.js";
import path from 'path'
import authController from './module/auth/auth.controller.js'
import userController from './module/users/user.controller.js'
import productController from './module/product/product.controller.js'
import categoryController from './module/categories/category.controller.js'
import cartController from './module/cart/cart.controller.js'
import orderController from './module/order/order.controller.js'
import testimonialController from './module/testimonial/testimonial.controller.js'
import { globalErrorHandling } from "./utils/response.js";
import cors from "cors";
import { sendEmail } from "./utils/Email/send.email.js";






const bootStrap = async () => {





    const app = express();
    const port = process.env.PORT || 5000;

    //// DB connection 

    await connectDB()



    /// convert buffer data

    app.use(express.json());
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

    app.use(cors());

    /// application routing 
    app.use('/auth', authController)
    app.use('/user', userController)
    app.use('/product', productController)
    app.use('/category', categoryController)
    app.use('/cart', cartController)
    app.use('/order', orderController)
    app.use('/testimonial', testimonialController)



    app.all('{/*dumy}', (req, res) => {
        return res.status(404).send('<h1>In-Valid Application Routing ❌❌</h1>')
    })

    app.use(globalErrorHandling)


    //// listen port 
    app.listen(port, () => {
        console.log(`Server is running on port:: ${port} 🚀🚀`);

    })
}


export default bootStrap;