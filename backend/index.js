import express from "express";
import morgan from "morgan";
import dotenv from "dotenv"
import cors from "cors";
import authRoutes from "./routes/authRoutes.js"
import shopRoutes from "./routes/shopRoutes.js"
import employeeRoutes from "./routes/employeeRoutes.js"
import templateRoutes from "./routes/templateRoutes.js"
import jobRoutes from "./routes/jobRoutes.js"
import connectDB from "./model/model.js";
import rateLimit from "express-rate-limit";
import machineRouets from './routes/machineRouets.js'

dotenv.config();
const app= express();

// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000, // 15 minutes
// 	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
// 	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
// 	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
// 	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
// 	// store: ... , // Redis, Memcached, etc. See below.
// })

// app.use(limiter)
app.use(express.json());

app.use(morgan('dev'))
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://jobmanagementsystem-1.onrender.com',
    'https://jobmanagemet.vercel.app/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



connectDB();

app.use('/v1/auth',authRoutes);
app.use('/v1/shop',shopRoutes);
app.use('/v1/employee',employeeRoutes);
app.use('/v1/machine',machineRouets);
app.use('/v1/template',templateRoutes)
app.use('/v1/jobs',jobRoutes)

app.get('/',(req,res)=>{
  
})



const PORT= process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`App is listening on port ${PORT}`);

})
