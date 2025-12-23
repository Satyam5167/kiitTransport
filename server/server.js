import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes.js'
import cookieParser from 'cookie-parser';
import auth from './routes/auth.js'
import adminRoutes from './routes/adminRoutes.js'

const PORT = process.env.PORT;

const app = express();


//middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser(process.env.JWT_SECRET))




app.use('/api/auth', authRoutes)
app.use('/api', auth)
app.use('/api/admin', adminRoutes)

app.listen(PORT, ()=>{
    console.log(`Server is listening on PORT: ${PORT}`)
})