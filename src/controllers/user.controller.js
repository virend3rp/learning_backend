import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";

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
    const User=await User.create({
        fullName,
        email,
        username:username.toLowerCase(),
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })
    const UserCreated=await User.findById(User._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"Failed to create user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser)
    )
      
  });  
export {registerUser} 