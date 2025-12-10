import CustomerModel from "../schema/customerSchema.js";

export const createNewCustomer= async (req,res)=>{
    try {

        const {name,email,phone,address, productId,productModel,productIdentification,shopId,trnNumber}= req.body;
        if(!name || !email || !phone || !address || !shopId|| !productId || !productModel || !productIdentification || !trnNumber){
            return res.status(400).send({
                success:false,
                message:"All fields are required",
            });
        }
        const newCustomer= new CustomerModel({
            name,
            email,
            phone,
            address,
            shopId,
            trnNumber,
            productId,
            productModel,
            productIdentification
        });

        await newCustomer.save();
        if(!newCustomer){
            return res.status(400).send({
                success:false,
                message:"Failed to create customer"
            });
        }

        res.status(201).send({
            success:true,
            message:"Customer created successfully",
            customer:newCustomer
        });
        
    } catch (error) {
        console.error("Error creating new customer:", error);
        res.status(500).send({
            success:false,
             message: "Internal server error" ,
             error,
            });
    }
}


export const getCustomerList= async (req,res)=>{
    try {
        const customers= await CustomerModel.find({});
        if(!customers){
            return res.status(404).send({
                success:false,
                message:"No customers found"
            });
        }
        res.status(200).send({
            success:true,
            message:"Customer list fetched successfully",
            customers
        });
    } catch (error) {
        console.error("Error fetching customer list:", error);
        res.status(500).send({  
            success:false,
             message: "Internal server error" ,
             error,
            });
    }
}


export const getShopCustomerList= async (req,res)=>{
    try {
        const {shopId}= req.params;
        const customers= await CustomerModel.find({shopId});
        if(!customers){
            return res.status(404).send({  
                success:false,
                message:"No customers found for this shop"
            });
        }
        res.status(200).send({
            success:true,
            message:"Shop customer list fetched successfully",
            customers
        });
    } catch (error) {
        console.error("Error fetching shop customer list:", error);
        res.status(500).send({  
            success:false,
             message: "Internal server error" ,
             error,
            });
    }
}


export const getCustomerById= async (req,res)=>{
    try {
        const {id}= req.params;
        const customer= await CustomerModel.findById(id);
        if(!customer){
            return res.status(404).send({
                success:false,
                message:"Customer not found"
            });
        }
        res.status(200).send({
            success:true,
            message:"Customer fetched successfully",
            customer
        });
    }
        catch (error) { 
        console.error("Error fetching customer by ID:", error);
        res.status(500).send({  
            success:false,
             message: "Internal server error" ,
             error,
            });
    }
}



export const updateCustomerById= async (req,res)=>{
    try {
        const {id}= req.params;
        const updates= req.body;
        const updatedCustomer= await CustomerModel.findByIdAndUpdate(id,updates,{new:true});
        if(!updatedCustomer){
            return res.status(404).send({
                success:false,
                message:"Customer not found"
            });
        }
        res.status(200).send({
            success:true,
            message:"Customer updated successfully",
            customer:updatedCustomer
        });
    } catch (error) {
        console.error("Error updating customer by ID:", error);
        res.status(500).send({
            success:false,
             message: "Internal server error" ,
             error,
            });
    }
}


export const deleteCustomerById= async (req,res)=>{
    try {
        const {id}= req.params; 
        const deletedCustomer= await CustomerModel.findByIdAndDelete(id);
        if(!deletedCustomer){
            return res.status(404).send({
                success:false,
                message:"Customer not found"
            });
        }
        res.status(200).send({
            success:true,
            message:"Customer deleted successfully",
            customer:deletedCustomer
        });
    } catch (error) {
        console.error("Error deleting customer by ID:", error);
        res.status(500).send({
            success:false,
            message: "Internal server error" , 
            error,
            });
    }
}