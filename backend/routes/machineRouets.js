import  express from "express"
import { isOwner } from "../middleware/middlewares.js";
import { createMachineController, getSingleMachineController, updateMachineController, deleteMachineController } from "../controllers/machineController.js";


const router= express.Router();

// add new machiene to the shop
router.post('/create-machiene',isOwner,createMachineController)

//get Individual Machines
router.get('/getSingle/:id',getSingleMachineController)

router.put('/updateMachine/:id',updateMachineController)

router.delete("/deleteMachine/:id", deleteMachineController)


export default router;