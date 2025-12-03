import express from 'express'
import cors from 'cors'

const PORT = process.env.PORT || 5000;

const app = express();


//middleware
app.use(express.json());
app.use(cors());
















app.listen(PORT, ()=>{
    console.log(`Sever is listening on PORT: ${PORT}`)
})