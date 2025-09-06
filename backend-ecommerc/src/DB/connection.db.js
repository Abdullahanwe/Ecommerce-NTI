import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const uri = process.env.DB_URI;
        const result = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000
        });
        console.log(result.models);
        console.log('DB Connected 👌👌❤️');


    } catch (error) {
        console.log(`Fail to connect on DB`, error);

    }
}


export default connectDB;