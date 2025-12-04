import express from 'express';
import { createNewCustomer, getCustomerList,getShopCustomerList,getCustomerById, updateCustomerById,deleteCustomerById} from '../controllers/customerController.js';


const router= express.Router();
//create new customer
router.post('/create',createNewCustomer);


//get all customers
 router.get('/list',getCustomerList);

//get customers by shop id
 router.get('/list/:shopId',getShopCustomerList);

//get customer by id
router.get('/:id',getCustomerById);


//update customer by id
 router.put('/:id',updateCustomerById);

//delete customer by id
 router.delete('/:id',deleteCustomerById);



export default router;

