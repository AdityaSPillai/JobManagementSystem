import { hashPassword } from "../helpers/authHelper.js";
import ShopModel from "../schema/shopSchema.js";
import UserModel from "../schema/userSchema.js";

export const createEmployeeController = async(req, res) => {
    try {
        const {name, email, password, role, shopname, phone, specialization, hourlyRate, experience} = req.body;

        // Basic validations
        if(!name) return res.status(400).send({success: false, message: "Name is Required"});
        if(!email) return res.status(400).send({success: false, message: "Email is Required"});
        if(!shopname) return res.status(400).send({success: false, message: "Shopname is Required"});
        if(!role) return res.status(400).send({success: false, message: "Role is Required"});
        if(!phone) return res.status(400).send({success: false, message: "Phone is Required"}); // Fixed message
        if(!hourlyRate) return res.status(400).send({success: false, message: "Workers hourly salary is required"});
        if(!experience) return res.status(400).send({success: false, message: "Experience is Required"});

        console.log(role);
        // Password validation - only required for non-worker roles
        if(role !== 'worker' && !password) {
            return res.status(400).send({success: false, message: "Password is Required for this role"});
        }
        
        // Specialization validation - required for all roles except desk_employee
        if(role !== "desk_employee" && !specialization) {
            return res.status(400).send({success: false, message: "Worker specialization is required"});
        }

        let hashedPassword = null;

        // Hash the password only if provided
        if(password) {
            hashedPassword = await hashPassword(password);
        }

        // Check if shop exists 
        const shop = await ShopModel.findOne({ shopName: shopname });
        if (!shop) {
            return res.status(400).send({ success: false, message: "Shop was not found" });
        }

        const shopId = shop._id;

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
            hourlyRate,
            experience,
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
        console.error("Error creating worker:", error);
        res.status(500).send({
            success: false,
            message: "Unable to add new worker",
            error: error.message,
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
        const {name,role,phone,isAvailable}=req.body

        const newEmployeeData={
        name,
        role,
        phone,
        isAvailable
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