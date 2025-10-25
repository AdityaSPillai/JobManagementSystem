import express from "express"
import { getSingleUserController, loginController, SignupController } from "../controllers/authController.js";

const router=express.Router();

router.post('/singup',SignupController);


router.post('/login',loginController)

router.get('/user/:id',getSingleUserController)




export default router;