import express from "express"
import { createShop, getAllEmployees,getAllWorkers,getAllMachineController, getAllShopJobsController,allServices,addNewCategoryController,addNewService,updateShopServices,deleteShopService,updateCategoryController, deleteCategoryController,allCategories, getAllClient} from "../controllers/shopController.js";
import {isOwner} from "../middleware/middlewares.js";
import { addMachineCategoryController, deleteMachineCategoryController, getAllMachineCategoryController, getHourlyRateController, updateMachineCategoryController } from "../controllers/machineCategoryController.js";

const router= express.Router();

router.post('/create',isOwner,createShop);

// adding new services to shop;
router.post('/addNewService/:shopId',isOwner,addNewService)

//get all services
router.get('/allServices/:shopId',allServices)

//update shop servies
router.put('/updateShopServices/:shopId/:serviceId',isOwner,updateShopServices)

//delete service
router.delete("/deleteShopService/:shopId/:serviceId",deleteShopService)



//add new machine category
router.post("/addMachineCategory/:shopId",addMachineCategoryController)

//get all machine category
router.get("/allMachineCategory/:shopId",getAllMachineCategoryController)

//update machine category
router.put("/updateMachineCategory/:shopId/:categoryId",updateMachineCategoryController)

//delete machine category
router.delete("/deleteMachineCategory/:shopId/:categoryId",deleteMachineCategoryController)

//get price of a selected category
router.get('/getHourlyRate/:shopId/:type',getHourlyRateController)



// add new category
router.post('/addNewCategory/:shopId',addNewCategoryController)

//get all category
router.get('/allCategories/:shopId',allCategories)

//update category
router.put('/updateCategory/:shopId/:categoryId',updateCategoryController)

//delete Category
router.delete('/deleteCategory/:shopId/:categoryId',deleteCategoryController)






// get all employees
router.get('/getAllEmployees/:shopId',getAllEmployees)

//get all employees with role of worker
router.get("/getAllWorkers/:shopId",getAllWorkers)

//get all machines
router.get("/getAllMachines/:shopId",getAllMachineController)

//get all jobs in the shop
router.get("/getAllJobs/:shopId",getAllShopJobsController);



router.get('/allClients/:shopId',getAllClient)


export default router;