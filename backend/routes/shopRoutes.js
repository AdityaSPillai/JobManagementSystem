import express from "express"
import { createShop, getAllEmployees,getAllWorkers,getAllMachineController } from "../controllers/shopController.js";
import {isOwner} from "../middleware/middlewares.js";

const router= express.Router();

router.post('/create',isOwner,createShop);
// get all employees
router.get('/getAllEmployees/:shopId',isOwner,getAllEmployees)

//get all employees with role of worker
router.get("/getAllWorkers/:shopId",getAllWorkers)

//get all machines
router.get("/getAllMachines/:shopId",getAllMachineController)


export default router;