import express from "express";
import { isAllowed, isManager, isQA } from "../middleware/middlewares.js";
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
    updateActualCostController,
    supervisorApproval,
    supervisorRejection
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

//supervisor approval
router.put('/supervisor-approve/:jobId',logAction("SUPERVISOR_APPROVED", req => ({ body: req.body })),supervisorApproval)

//supervosor quality check bad
router.post('/qualityBad/:jobId/:userId',logAction("SUPERVISOR_JOB_REJECTED", req => ({ body: req.body })),supervisorRejection)


//perform quality check
router.put('/qualityGood/:jobId/:jobItemId/:userId',isQA,logAction("JOB_ACCEPTED", req => ({ body: req.body })),qualityGoodController)
router.post('/qualityBad/:jobId/:jobItemId/:userId',isQA,logAction("JOB_NEED_WORK", req => ({ body: req.body })),qualityBadController)

//vuser verification of job
router.post('/verifyJob/:jobId',isManager,logAction("ACCEPTED_BY_CUSTOMER", req => ({ body: req.body })),verifyJobController)


router.put(`/actual-cost/:jobId`, updateActualCostController);



export default router;