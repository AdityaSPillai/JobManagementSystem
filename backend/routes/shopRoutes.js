import express from "express"
import { createShop,getShop, getAllEmployees,getAllWorkers,getAllMachineController, getAllShopJobsController,allServices,addNewCategoryController,addNewService,updateShopServices,deleteShopService,updateCategoryController, deleteCategoryController,allCategories, getAllClient, addConsumablesController, getAllConsumablesController, updateConsumableController, deleteConsumableController, addLog, updateShopController, getShopDetails} from "../controllers/shopController.js";
import {isOwner} from "../middleware/middlewares.js";
import { addMachineCategoryController, deleteMachineCategoryController, getAllMachineCategoryController, getHourlyRateController, updateMachineCategoryController } from "../controllers/machineCategoryController.js";
import { getLogs, updateLogLimit } from "../controllers/shopController.js";
import { logAction } from "../middleware/logMiddleware.js";

const router= express.Router();

router.post('/create',isOwner,createShop);

router.put("/updateShop/:shopId",isOwner,logAction("UPDATE_SHOP", req => ({ body: req.body })),updateShopController);

router.get("/getShop/:shopId", isOwner, getShopDetails);

router.get('/getShopName/:id',getShop)

// adding new services to shop;
router.post('/addNewService/:shopId',isOwner,logAction("CREATE_SERVICE", req => ({ body: req.body })),addNewService)

//get all services
router.get('/allServices/:shopId',allServices)

//update shop servies
router.put('/updateShopServices/:shopId/:serviceId',isOwner,logAction("UPDATE_SERVICE", req => ({ id: req.params.id, body: req.body })),updateShopServices)

//delete service
router.delete("/deleteShopService/:shopId/:serviceId",deleteShopService)



//add new machine category
router.post("/addMachineCategory/:shopId",isOwner,logAction("CREATE_MACHINE_CATEGORY", req => ({ body: req.body })),addMachineCategoryController)

//get all machine category
router.get("/allMachineCategory/:shopId",getAllMachineCategoryController)

//update machine category
router.put("/updateMachineCategory/:shopId/:categoryId",isOwner,logAction("UPDATE_MACHINE_CATEGORY", req => ({ id: req.params.id, body: req.body })),updateMachineCategoryController)

//delete machine category
router.delete("/deleteMachineCategory/:shopId/:categoryId",deleteMachineCategoryController)

//get price of a selected category
router.get('/getHourlyRate/:shopId/:type',getHourlyRateController)



// add new category
router.post('/addNewCategory/:shopId',isOwner,logAction("CREATE_MAN_POWER_CATEGORY", req => ({ body: req.body })),addNewCategoryController)

//get all category
router.get('/allCategories/:shopId',allCategories)

//update category
router.put('/updateCategory/:shopId/:categoryId',isOwner,logAction("UPDATE_MAN_POWER_CATEGORY", req => ({ id: req.params.id, body: req.body })),updateCategoryController)

//delete Category
router.delete('/deleteCategory/:shopId/:categoryId',deleteCategoryController)




// Add consumables
router.post('/addConsumables/:shopId',isOwner,logAction("CREATE_CONSUMABLES", req => ({ body: req.body })), addConsumablesController);

// Get all consumables
router.get('/allConsumables/:shopId', getAllConsumablesController);

// Update consumable
router.put('/updateConsumable/:shopId/:consumableId',isOwner,logAction("UPDATE_CONSUMABLES", req => ({ id: req.params.id, body: req.body })), updateConsumableController);

// Delete consumable
router.delete('/deleteConsumable/:shopId/:consumableId', deleteConsumableController);




// get all employees
router.get('/getAllEmployees/:shopId',getAllEmployees)

//get all employees with role of worker
router.get("/getAllWorkers/:shopId",getAllWorkers)

//get all machines
router.get("/getAllMachines/:shopId",getAllMachineController)

//get all jobs in the shop
router.get("/getAllJobs/:shopId",getAllShopJobsController);



router.get('/allClients/:shopId',getAllClient);

router.get("/logs/:shopId", isOwner, getLogs);

router.put("/logs/limit/:shopId", isOwner, updateLogLimit);


export default router;