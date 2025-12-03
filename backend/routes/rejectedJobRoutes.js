import express from 'express';
import { rejectedJobController,getRejectedJobsController } from '../controllers/rejectJobController.js';


const router=express.Router();


router.post('/rejectJob', rejectedJobController);


router.get('/getAll',getRejectedJobsController);

export default router;