import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes.js'
import cookieParser from 'cookie-parser';


const PORT = process.env.PORT;

const app = express();


//middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser(process.env.JWT_SECRET))





app.use('/api/auth', authRoutes)


app.listen(PORT, ()=>{
    console.log(`Server is listening on PORT: ${PORT}`)
})