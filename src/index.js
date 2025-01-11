import dotenv from "dotenv"
import connectDB from "./db/index.js";
connectDB()

dotenv.config(
    {
        path:'./env'
    }
)