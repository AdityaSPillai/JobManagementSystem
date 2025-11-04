import express from "express"
import { getSingleUserController, loginController, SignupController } from "../controllers/authController.js";

const router=express.Router();

router.post('/signup',SignupController);


router.post('/login',loginController)

router.get('/user/:id',getSingleUserController)



export default router;