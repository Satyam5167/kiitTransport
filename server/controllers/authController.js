import * as authQueries from '../queries/authQueries.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
  return emailRegex.test(email);
}


const generateToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    )
}

export const register = async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: "every field must be filled" })
    }

    try {
        const existingUser = await authQueries.findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: "User already registered" })
        const password_hash = await bcrypt.hash(password, 8)
        const newUser = await authQueries.createUser(email, role, password_hash, name, phone);
        const token = generateToken(newUser)

        res.cookie('token', token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            maxAge: 3600000, // 1 hour in milliseconds
            sameSite: 'strict' // Prevent CSRF attacks
        });

        res.json({ message: "Registration Succesfull"})
    } catch (e) {
        console.log(e.message)
        return res.status(500).json({ message: "registration failed internal server error" })
    }
}

export const login = async (req, res) => {
    const {email , phone, password} = req.body;
    let existingUser
    if(isValidEmail(email)){
        if(!password) return res.status(400).json({message:"Email Or Password is not valid"})
        existingUser = await authQueries.findUserByEmail(email)
    }else{
        if(!phone) return res.status(400).json({message:"Phone or Password is not valid"})
        existingUser = await authQueries.findUserByPhone(phone)
    }

    const isValidUser = await bcrypt.compare(password,existingUser.password_hash)

    try {
        if(isValidUser){
        const token = generateToken(existingUser)
        res.cookie('token', token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            maxAge: 3600000, // 1 hour in milliseconds
            sameSite: 'strict' // Prevent CSRF attacks
        });

        res.json({message:"Login Sucessfull"})
    }
    } catch (e) {
        console.log(e.message)
        res.status(500).json({message:"Internal Server Error"})
    }

}