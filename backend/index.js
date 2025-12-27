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
import machineRouets from './routes/machineRouets.js'
import rejectedJobRoutes from './routes/rejectedJobRoutes.js'
import customerRoutes from "./routes/customerRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use(morgan('dev'))
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://jobmanagementsystem-1.onrender.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


connectDB();

app.use('/v1/auth', authRoutes);
app.use('/v1/shop', shopRoutes);
app.use('/v1/employee', employeeRoutes);
app.use('/v1/machine', machineRouets);
app.use('/v1/template', templateRoutes)
app.use('/v1/jobs', jobRoutes)
app.use('/v1/reject/', rejectedJobRoutes)
app.use('/v1/customer', customerRoutes);

app.get('/', (req, res) => {

})


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);

})