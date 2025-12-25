import express from "express";
import { isAllowed, isManager, isQA } from "../middleware/middlewares.js";
import {
    createJobCard,
    deleteJobController,
    getAllJobs,
    updateJobSettings,
    startMachineForJobItem,
    endMachineForJobItem,
    startWorkerTimer,
    endWorkerTimer,
    assignWorkerController,
    qualityGoodController,
    qualityBadController,
    verifyJobController,
    updateActualCostController,
    supervisorApproval,
    supervisorRejection,
    getAllJobsByCustomerID,
    usedConsumableController,
    pauseWorkerTImer,
    pauseMachineForJobItem,
    completeJobItemController,
    removeWorkerFromJobItem,
    assignMachineController,
    removeMachineFromJobItem,
    assignConsumableController,
    updateConsumableQuantityController,
    removeConsumableController
} from "../controllers/jobController.js";
import { logAction } from "../middleware/logMiddleware.js";

const router = express.Router();


//crete new job
router.post('/new-job', isAllowed, logAction("CREATE_JOB", req => ({ body: req.body })), createJobCard);


//get all jobs available
router.get('/allJobs', getAllJobs)

//get all jobs by the customer id
router.get('/jobbycustomer/:customerIDNumber', getAllJobsByCustomerID)

//update job
router.put('/update-job/:jobId', isAllowed, logAction("UPDATE_JOB", req => ({ id: req.params.id, body: req.body })), updateJobSettings)

//delete job
router.delete('/delete-job/:jobId', deleteJobController)


//assign worker to job

router.put('/assign-worker/:userId/:jobId/:jobItemId', assignWorkerController)

router.delete('/remove-worker/:jobId/:jobItemId/:workerObjectId', removeWorkerFromJobItem);

router.put('/assign-machine/:machineId/:jobId/:jobItemId', assignMachineController);

router.delete('/remove-machine/:jobId/:jobItemId/:machineId', removeMachineFromJobItem);

router.put('/assign-consumable/:jobId/:jobItemId', assignConsumableController);

router.put('/update-consumable-qty/:jobId/:jobItemId/:consumableId', updateConsumableQuantityController);

router.delete('/remove-consumable/:jobId/:jobItemId/:consumableId', removeConsumableController);


// start  machine working timer
router.post('/start-machine-timer/:jobId/:jobItemId/:machineId', startMachineForJobItem)

//pause machine timer
router.post('/pause-machine-timer/:jobId/:jobItemId/:machineId', pauseMachineForJobItem)

//end  machine working timer
router.post('/end-machine-timer/:jobId/:jobItemId/:machineId', endMachineForJobItem)

//start worker timer
router.post('/start-worker-timer/:jobId/:jobItemId/:workerObjectId', startWorkerTimer)

router.post('/pause-worker-timer/:jobId/:jobItemId/:workerObjectId', pauseWorkerTImer)

router.post('/end-worker-timer/:jobId/:jobItemId/:workerObjectId', endWorkerTimer)

router.post('/complete-jobitem/:jobId/:jobItemId', completeJobItemController)

//supervisor approval
router.put('/supervisor-approve/:jobId', logAction("SUPERVISOR_APPROVED", req => ({ body: req.body })), supervisorApproval)

//supervosor quality check bad
router.post('/qualityBad/:jobId/:userId', logAction("SUPERVISOR_JOB_REJECTED", req => ({ body: req.body })), supervisorRejection)


//perform quality check
router.put('/qualityGood/:jobId/:jobItemId/:userId', isQA, logAction("JOB_ACCEPTED", req => ({ body: req.body })), qualityGoodController)
router.post('/qualityBad/:jobId/:jobItemId/:userId', isQA, logAction("JOB_NEED_WORK", req => ({ body: req.body })), qualityBadController)

//vuser verification of job
router.post('/verifyJob/:jobId', isManager, logAction("ACCEPTED_BY_CUSTOMER", req => ({ body: req.body })), verifyJobController)

router.put('/usedConsumable/:jobId/:jobItemId/:consumableId', isAllowed, logAction("USED_CONSUMABLE", req => ({ body: req.body })), usedConsumableController)


router.put(`/actual-cost/:jobId`, updateActualCostController);



export default router;