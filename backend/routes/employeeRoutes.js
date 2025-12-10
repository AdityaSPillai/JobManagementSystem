import express from "express";
import { isManager } from "../middleware/middlewares.js";
import { createEmployeeController,deleteEmployeeController,getEmployeeController,updateEmployeeController } from "../controllers/employeeController.js";
import { logAction } from "../middleware/logMiddleware.js";

const router= express.Router();

// get single employee
router.get('/get/:empid',getEmployeeController)

router.post(
  '/createEmployee',
  isManager,
  logAction("CREATE_EMPLOYEE", req => ({ body: req.body })),
  createEmployeeController
);

router.put(
  '/updateEmployee/:empid',
  isManager,
  logAction("UPDATE_EMPLOYEE", req => ({ id: req.params.empid, body: req.body })),
  updateEmployeeController
);

router.delete(
  '/deleteEmployee/:empid',
  isManager,
  logAction("DELETE_EMPLOYEE", req => ({ id: req.params.empid })),
  deleteEmployeeController
);

export default router;