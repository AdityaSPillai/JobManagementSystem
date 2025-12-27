import express from "express"
import { isManager } from "../middleware/middlewares.js";
import { createMachineController, getSingleMachineController, updateMachineController, deleteMachineController } from "../controllers/machineController.js";
import { logAction } from "../middleware/logMiddleware.js";

const router = express.Router();

// add new machiene to the shop
router.post('/create-machiene', isManager, logAction("CREATE_MACHINE", req => ({ body: req.body })), createMachineController)

//get Individual Machines
router.get('/getSingle/:id', getSingleMachineController)


router.put('/updateMachine/:id', isManager, logAction("UPDATE_MACHINE", req => ({ id: req.params.id, body: req.body })), updateMachineController)

router.delete("/deleteMachine/:id", isManager, logAction("DELETE_MACHINE", req => ({ id: req.params.id })), deleteMachineController)


export default router;