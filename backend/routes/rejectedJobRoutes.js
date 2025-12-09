import express from 'express';
import { rejectedJobController,getRejectedJobsController, getAllShopRejecetedJobsController, deleteRejectedJobController } from '../controllers/rejectJobController.js';
import { logAction } from "../middleware/logMiddleware.js";
import { isAllowed, isOwner } from '../middleware/middlewares.js';

const router=express.Router();

//reject job routes
router.post('/rejectJob',isAllowed,logAction("REJECT_JOB", req => ({ body: req.body })),rejectedJobController);

// get all rejected jobs
router.get('/getAll',getRejectedJobsController);


//get the rejected job of one shop
router.get('/getAll/:shopId',getAllShopRejecetedJobsController);

router.delete('/deleteJob/:jobId',isOwner,logAction("DELETE_REJECT_JOB", req => ({ id: req.params.id })),deleteRejectedJobController);

export default router;