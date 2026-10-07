import bcrypt from "bcryptjs"

import User from "../models/user.model.js"
import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../utils/util.js"


export const signup = async (req, res) => {
    const {fullName, email, password} = req.body

    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({message: "All field required"})
        }

        if(password.length < 8) {
            return res.status(400).json({message: "Password must be atleast 8 characters long"})
        }

        const user = await User.findOne({email})

        if(user) {
            return res.status(400).json({message: "User already exist with this email"})
        }

        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName, 
            email,
            password: hashedPassword
        })

        if(newUser) {
            generateToken(newUser._id, res)
            await newUser.save()

            return res.status(201).json({
                id: newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic
            })
        }else {
            res.status(400).json({message: "Invalid User data"})
        }
    } catch (error) {
        console.error("There is error in sign up controller: ", error.message)
        res.status(500).json({message: "Internal server error"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.findOne({email})

        if(!user) {
            return res.status(400).json({message: "Invalid Credentials"})
        }
        
        const isPassword = await bcrypt.compare(password, user.password)
        
        if(!isPassword) {
            return res.status(400).json({message: "Invalid Credentials"})
        }

        generateToken(user._id, res)

        res.status(200).json({
            id: user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic
        })

    } catch (error) {
        console.error("Error in login Controller: ", error.message)
        res.status(500).json({message: "Internal server error"})
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0})
        res.status(200).json({message: "Logout Successful"})
    } catch (error) {
        console.error("Error in logout Controller: ", error.message)
        res.status(500).json({message: "Internal server error"})
    }
}

export const update = async (req, res) => {
    try {
        const {profilePic} = req.body

        const userId = req.user_id

        if(!profilePic) return res.status(400).json({message: "Profile Pic is required"})

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            {profilePic: uploadResponse.secure_url}, 
            {new: true}
        )

        res.status(200).json(updatedUser)
        
    } catch (error) {
        console.error("Error in update Controller: ", error.message)
        res.status(500).json({message: "Internal server error"})    
    }
}