import express from "express"
import { isAdmin } from "../middleware/middlewares.js";
import { deleteTemplate, getActiveTemplate, getAllTemplates, saveTemplateController, setActiveTemplate } from "../controllers/templatesController.js";


const router= express.Router();


// create new templates
router.post('/templates',isAdmin,saveTemplateController)

// get all  templates
router.get('/templates',isAdmin,getAllTemplates);

//get all active templates
router.get('/templates/active',isAdmin,getActiveTemplate);

//set template id as active
router.put('/templates/:templateId/activate',isAdmin, setActiveTemplate)

//  delete template
router.delete('/templates/:templateId',isAdmin,deleteTemplate);

export default router;