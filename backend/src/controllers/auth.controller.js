import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import { generatorToken } from "../utils/util.js"

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
            generatorToken(newUser._id, res)
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

export const login = async (req, res) => {}

export const logout = async (req, res) => {}

export const update = async (req, res) => {}