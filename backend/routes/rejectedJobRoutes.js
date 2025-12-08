import express from 'express';
import { rejectedJobController,getRejectedJobsController, getAllShopRejecetedJobsController } from '../controllers/rejectJobController.js';


const router=express.Router();

//reject job routes
router.post('/rejectJob', rejectedJobController);

// geta ll rejected jobs
router.get('/getAll',getRejectedJobsController);


//get the rejected job of one shop
router.get('/getAll/:shopId',getAllShopRejecetedJobsController);



export default router;