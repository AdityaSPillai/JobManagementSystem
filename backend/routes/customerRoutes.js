import express from 'express';
import { createNewCustomer, getCustomerList,getShopCustomerList,getCustomerById, updateCustomerById,deleteCustomerById} from '../controllers/customerController.js';
import { logAction } from "../middleware/logMiddleware.js";
import { isAllowed } from '../middleware/middlewares.js';

const router= express.Router();
//create new customer
router.post('/create',isAllowed,logAction("CREATE_CUSTOMER", req => ({ body: req.body })),createNewCustomer);

//get all customers
 router.get('/list',getCustomerList);

//get customers by shop id
 router.get('/list/:shopId',getShopCustomerList);

//get customer by id
router.get('/:id',getCustomerById);

//update customer by id
 router.put('/:id',isAllowed,logAction("UPDATE_CUSTOMER", req => ({ id: req.params.id, body: req.body })),updateCustomerById);

//delete customer by id
 router.delete('/:id',isAllowed,logAction("DELETE_CUSTOMER", req => ({ id: req.params.id })),deleteCustomerById);


export default router;