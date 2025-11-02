import express from "express"
import { createShop, getAllEmployees,getAllWorkers,getAllMachineController, getAllShopJobsController,allServices,addNewService,updateShopServices,deleteShopService} from "../controllers/shopController.js";
import {isOwner} from "../middleware/middlewares.js";

const router= express.Router();

router.post('/create',isOwner,createShop);

// adding new services to shop;
router.post('/addNewService/:shopId',isOwner,addNewService)


//update shop servies
router.put('/updateShopServices/:shopId/:serviceId',isOwner,updateShopServices)



//get all services
router.get('/allServices/:shopId',allServices)



// get all employees
router.get('/getAllEmployees/:shopId',getAllEmployees)

//get all employees with role of worker
router.get("/getAllWorkers/:shopId",getAllWorkers)

//get all machines
router.get("/getAllMachines/:shopId",getAllMachineController)

//get all jobs in the shop
router.get("/getAllJobs/:shopId",getAllShopJobsController);



router.delete("/deleteShopService/:shopId/:serviceId",deleteShopService)


export default router;