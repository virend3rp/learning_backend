import dotenv from "dotenv"
import connectDB from "./db/index.js";
connectDB().then(
    app.listen(process.env.PORT|| 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
).catch((err) => {
    console.error(`Error connecting to MongoDB: ${err.message}`);
})

dotenv.config(
    {
        path:'./env'
    }
)