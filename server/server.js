import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes.js'
import cookieParser from 'cookie-parser';
import auth from './routes/auth.js'
import adminRoutes from './routes/adminRoutes.js'
import publicRoutes from './routes/publicRoutes.js'

const PORT = process.env.PORT;

const app = express();


//middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser(process.env.JWT_SECRET))



//routes to login driver and admin only
app.use('/api/auth', authRoutes)
//routes to verify the admin
app.use('/api', auth)
//routes for admin only 
app.use('/api/admin', adminRoutes)
//routes for public can be used by anyone 
app.use('/api', publicRoutes)

app.listen(PORT, ()=>{
    console.log(`Server is listening on PORT: ${PORT}`)
})