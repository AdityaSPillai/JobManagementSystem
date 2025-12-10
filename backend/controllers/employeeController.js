import { hashPassword } from "../helpers/authHelper.js";
import ShopModel from "../schema/shopSchema.js";
import UserModel from "../schema/userSchema.js";

export const createEmployeeController = async(req, res) => {
    try {
        const {name, email, password, role, shopId, phone, specialization,employeeNumber, experience} = req.body;
        if (role === "supervisor") {
            if (req.user?.role !== "owner") {
                return res.status(403).send({
                    success: false,
                    message: "Only owners can create supervisor accounts"
                });
            }
        }
        // Basic validations
        if(!name) return res.status(400).send({success: false, message: "Name is Required"});
        if(!email) return res.status(400).send({success: false, message: "Email is Required"});
        if(!shopId) return res.status(400).send({success: false, message: "shopId is Required"});
        if(!role) return res.status(400).send({success: false, message: "Role is Required"});
        if(!phone) return res.status(400).send({success: false, message: "Phone is Required"}); // Fixed message
        if(!experience) return res.status(400).send({success: false, message: "Experience is Required"});
        if(!employeeNumber) return res.status(400).send({success: false, message: "Employee Number is Required"});

        console.log(role);
        // Password validation - only required for non-worker roles
        if(role !== 'worker' && !password) {
            return res.status(400).send({success: false, message: "Password is Required for this role"});
        }
        
        // Specialization validation - required for all roles except desk_employee
        if(role !== "desk_employee" && !specialization) {
            return res.status(400).send({success: false, message: "Worker specialization is required"});
        }

        const shop = await ShopModel.findById(shopId);
        if (shop && !shop.categories.some(cat => cat.name === specialization)) {
            return res.status(400).send({
                success: false,
                message: "Invalid specialization. Must match a Job Category name."
            });
        }

        let hashedPassword = null;

        // Hash the password only if provided
        if(password) {
            hashedPassword = await hashPassword(password);
        }

        if (!shop) {
            return res.status(400).send({ success: false, message: "Shop was not found" });
        }


        // Check if user already exists
        const existingWorker = await UserModel.findOne({ email });
        if (existingWorker) {
            return res.status(400).send({ success: false, message: "Email already exists" });
        }

        // Create worker data object
        const workerData = {
            name,
            email,
            role,
            phone,
            shopId,
            experience,
            employeeNumber
        };

        // Add optional fields only if they exist
        if(hashedPassword) {
            workerData.password = hashedPassword;
        }
        
        if(specialization) {
            workerData.specialization = specialization;
        }

        // Create worker
        const worker = new UserModel(workerData);
        await worker.save();

        res.status(201).send({
            success: true,
            message: "Worker created successfully",
            worker,
        });
    } catch (error) {
        console.error("Error creating worker:", error.errorResponse.errmsg);
        res.status(500).send({
            success: false,
            message:  error.errorResponse.errmsg.slice(0,20) || "Error in creating worker",
            error: error,
        });
    }
};


export const getEmployeeController = async(req, res) => {
    try {
        const { empid } = req.params; 
        
        if(!empid) {
            return res.status(400).send({
                success: false,
                message: "Employee ID is required"
            });
        }

        const employee = await UserModel.findById(empid);

        if(!employee) {
            console.log("Unable to find the employee with the given ID");
            return res.status(404).send({
                success: false,
                message: "Employee not found with the given ID"
            });
        }

        res.status(200).send({
            success: true, 
            message: "Employee found successfully",
            employee
        });
        
    } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).send({
            success: false, 
            message: "Unable to fetch employee",
            error: error.message
        });
    }
};


export const updateEmployeeController= async(req,res)=>{
    try {
        
        const {empid}=req.params;
        const {name,role,phone,isAvailable,specialization,experience,employeeNumber}=req.body

        const newEmployeeData={
        name,
        role,
        phone,
        isAvailable,
        specialization,
        experience,
        employeeNumber
        }

        const employee= await UserModel.findByIdAndUpdate(empid,newEmployeeData,{ new: true })
        if(!employee)
        {
            console.log("Error while updating employee");
            return res.status(400).send({
                success:false,
                message:"unable to UPdate employee"
            })
        }

        res.status(200).send({
            success:true,
            message:"Employee updated Succesfully",
            employee
        })

        
    } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).send({
            success: false, 
            message: "Unable to Update employee",
            error: error.message
        });
    }
};


export const deleteEmployeeController= async(req,res)=>{
    try {
        const {empid}= req.params;

        const res= await UserModel.findByIdAndDelete(empid);
        if(!res)
        {console.log("Error while Deleting employee");
            return res.status(400).send({
                success:false,
                message:"unable to Delete employee"
            })
        }

        res.status(200).send({
            success:true,
            message:"Employee Deleted Succesfully",
            employee
        })
        
    } catch (error) {
        console.error("Error Deleting employee:", error);
        res.status(500).send({
            success: false, 
            message: "Unable to Deleting employee",
            error: error.message
        });
    }
};
