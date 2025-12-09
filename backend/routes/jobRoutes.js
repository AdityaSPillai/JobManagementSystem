import express from "express";
import { isAllowed } from "../middleware/middlewares.js";
import { createJobCard,
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
    pauseWrokerTImer,
    updateActualCostController
    } from "../controllers/jobController.js";
import { logAction } from "../middleware/logMiddleware.js";

const router= express.Router();


//crete new job
router.post('/new-job',isAllowed,logAction("CREATE_JOB", req => ({ body: req.body })),createJobCard);


//get all jobs available
router.get('/allJobs',getAllJobs)

//update job
router.put('/update-job/:jobId',isAllowed,logAction("UPDATE_JOB", req=>({id: req.params.id, body: req.body})),updateJobSettings)

//delete job
router.delete('/delete-job/:jobId',deleteJobController)


//assign worker to job

router.put('/assign-worker/:userId/:jobId/:jobItemId',assignWorkerController)


// start  machine working timer
router.put('/start-machine-timer/:jobId/:machineId',startMachineForJobItem,)

//end  machine working timer
router.put('/end-machine-timer/:jobId/:machineId',endMachineForJobItem,)

//start worker timer
router.post('/start-worker-timer/:jobId/:jobItemId/:workerObjectId',startWorkerTimer)

router.post('/pause-worker-timer/:jobId/:jobItemId/:workerObjectId',pauseWrokerTImer)

router.post('/end-worker-timer/:jobId/:jobItemId/:workerObjectId',endWorkerTimer)


//perform quality check
router.put('/qualityGood/:jobId/:jobItemId/',qualityGoodController)
router.post('/qualityBad/:jobId/:jobItemId/:userId',qualityBadController)

//vuser verification of job
router.post('/verifyJob/:jobId',verifyJobController)


router.put(`/actual-cost/:jobId`, updateActualCostController);



export default router;