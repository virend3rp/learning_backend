import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt, { decode } from "jsonwebtoken"
import {User} from "../models/user"

export const verifyJWT=asyncHandler(async(req, _,next)=>{
    try{
        const token=req.cookies?.accessToken|| req.header
        ("Authorization")?.replace("Bearer","")

        if(!token){
            throw new ApiError(401, "unauthorized request")
            }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401, "Invalid AccessToken")
        }
        req.user=user;
        next()
    }
    catch(err){
            throw new ApiError(401,err?.message || "Inavlid access Token")
    }
})