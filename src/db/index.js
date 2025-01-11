import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB =async() => {
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connection established!!`);
        console.log(`DB Name: ${connectionInstance.connection.name}`);
        console.log(`DB Host: ${connectionInstance.connection.host}`);
        console.log(`DB Port: ${connectionInstance.connection.port}`);

    } catch(err){
        console.log("MONGODB connection error:",err);
        process.exit(1);
    }

}

export default connectDB 