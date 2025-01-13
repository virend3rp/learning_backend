import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {bycrpt} from "bcrypt"

const generateAccessAndRefreshTokens=async(userId) =>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};
    }
    catch(err){
        throw new ApiError(500,"Failed to generate tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
  
    console.log(`username: ${username} and email: ${email}`);
  
    // Validate input fields
    if ([fullName, email, username, password].some((field) => !field?.trim())) {
      throw new ApiError(400, "All fields are required");
    }
    const existedUser= await User.findOne({
        $or:[{email},{username}]
    })

    if(existedUser){
        throw new ApiError(409, "Username or email already exists");
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    const newUser=await User.create({
        fullName,
        email,
        username:username.toLowerCase(),
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })
    const createdUser=await User.findById(newUser._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"Failed to create user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser)
    )
      
  });  

const loginUser=asyncHandler(async (req,res)=>{
    //req body se data leke aao
    //username or email 
    //find the user
    //password check
    //access and refresh token generation
    //send cookies
    //send response

    const{email,username,password}=req.body;
    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }
    const userExist=await User.findOne({
        $or : [{username},{email}]
    })
    if(!userExist){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid=await userExist.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user Credentials")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(userExist._id)

    const loggedinUser=await User.findById(userExist._id).select("-password -refreshToken")

    const options ={
        httpOnly: true,
        secure:true
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedinUser,accessToken,refreshToken
        })
    )
})

const logoutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true,
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200).clearCookie("accessToken",accessToken,options)
            .clearCookie("RefreshToken",refreshToken,options).json(new ApiResponse(200,{},"User logged out"))
});
export {
    registerUser,
    loginUser,
    logoutUser
} 