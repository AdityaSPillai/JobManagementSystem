import express from "express"
import { getSingleUserController, loginController, SignupController, deleteEmployeeController } from "../controllers/authController.js";

const router = express.Router();

router.post('/signup', SignupController);

router.post('/login', loginController)

router.get('/user/:id', getSingleUserController)

router.delete('/deleteEmployee/:id', deleteEmployeeController)

export default router;