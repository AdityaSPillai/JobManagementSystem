import express from "express";
import { isOwner } from "../middleware/middlewares.js";
import { createEmployeeController,getEmployeeController,updateEmployeeController } from "../controllers/employeeController.js";

const router= express.Router();

//create a new employee
router.post('/createEmployee',isOwner,createEmployeeController);

// get single employee
router.get('/get/:empid',getEmployeeController)

//upadte employee
router.put('/updateEmployee/:empid',isOwner,updateEmployeeController)




export default router;