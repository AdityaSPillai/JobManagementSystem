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
    verifyJobController
    } from "../controllers/jobController.js";

const router= express.Router();


//crete new job
router.post('/new-job',createJobCard);


//get all jobs available
router.get('/allJobs',getAllJobs)

//update job
router.put('/update-job/:jobId',updateJobSettings)

//delete job
router.delete('/delete-job/:jobId',deleteJobController)


//assign worker to job

router.put('/assign-worker/:userId/:jobId/:jobItemId',assignWorkerController)


// start  machine working timer
router.put('/start-machine-timer/:jobId/:machineId',startMachineForJobItem,)

//end  machine working timer
router.put('/end-machine-timer/:jobId/:machineId',endMachineForJobItem,)

//start worker timer
router.put('/start-worker-timer/:jobId/:userId',startWorkerTimer)

router.put('/end-worker-timer/:jobId/:userId',endWorkerTimer)


//perform quality check
router.put('/qualityGood/:jobId/:userId',qualityGoodController)
router.post('/qualityBad/:jobId/:userId',qualityBadController)

//vuser verification of job
router.post('/verifyJob/:jobId',verifyJobController)



export default router;