import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"


import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js"

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))

//Routes
app.use("/api/auth", authRoutes)



// Database Connection 
connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})
}).catch((error) => {
    console.error("Connection has error", error.message)
})
