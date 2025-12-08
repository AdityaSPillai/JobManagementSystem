import express from 'express';
import { rejectedJobController,getRejectedJobsController, getAllShopRejecetedJobsController, deleteRejectedJobController } from '../controllers/rejectJobController.js';


const router=express.Router();

//reject job routes
router.post('/rejectJob', rejectedJobController);

// get all rejected jobs
router.get('/getAll',getRejectedJobsController);


//get the rejected job of one shop
router.get('/getAll/:shopId',getAllShopRejecetedJobsController);

router.delete('/deleteJob/:jobId',deleteRejectedJobController);

export default router;