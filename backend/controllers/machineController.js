import MachineModel from "../schema/machieneModel.js";
import ShopModel from "../schema/shopSchema.js";

export const createMachineController =async(req,res)=>{
    try {
        const{
            name,
            type,
            status,
            purchaseDate,
            lastMaintenanceDate,
            nextMaintenanceDate,
            isActive,
            startTime,
            endTime,
            actualDuration,
            }= req.body;



            if(!name) return res.status(400).send({succcess:false, message:"Machiene name is Requied"})
            if(!type) return res.status(400).send({succcess:false, message:"Machiene Type is Requied"})
            if(!status) return res.status(400).send({succcess:false, message:"Machiene status is Requied"})
            if(!purchaseDate) return res.status(400).send({succcess:false, message:"Machiene purchaseDate is Requied"})
            if(!lastMaintenanceDate) return res.status(400).send({succcess:false, message:"Machiene lastMaintenanceDate is Requied"})
            if(!nextMaintenanceDate) return res.status(400).send({succcess:false, message:"Machiene nextMaintenanceDate is Requied"})
            if(!isActive) return res.status(400).send({succcess:false, message:"Machiene isActive is Requied"})


        
            
            
            // check if already existing
           
                const ownerId= req.body.userId;
                const shop=await ShopModel.findOne({ownerId})
                if(!shop)
                {
                    console.log("Couldnt find shop ");
                    return res.status(400).send({
                        succcess:false,
                        message:"Couldnt find the Shop to add the machiene to"
                    })
                }
                const shopId= shop._id;
              
                const machineData={
                   name,
                    type,
                    status,
                    purchaseDate,
                    shopId,
                    lastMaintenanceDate,
                    nextMaintenanceDate,
                    isActive,
                    startTime,
                    endTime,
                    actualDuration,
                }
                
            const machiene= new MachineModel(machineData);
            if(!machiene)
            {
                console.log("Error ehile adding the machiene data to the database");
                return res.status(404).send({
                    succcess:false,
                    message:"Error ehile adding the machiene data to the database"
                })
            }
            
            await machiene.save();

            res.status(200).send({
                succcess:true,
                message:"Machiene added succesfully",
            })
          

        
    } catch (error) {
        console.log(error)
    }
}


export const getSingleMachineController= async(req,res)=>{
    try {
        
        const {id}=req.params;
        if(!id) return res.status(400).send({succcess:false,message:"Machine ID is required"});

        const machine= await MachineModel.findById(id);
        if(!machine)
        {
            console.error("Can not get Machiene ",);
            return res.status(400).send({
                succcess:false,
                message:"Error while fetching the user",
            })
        }

            res.status(200).send({
                succcess:false,
                message:"Machine found succesfully",
                machine
            })
    } catch (error) {
        
    }
};


export const updateMachineController= async(req,res)=>{
    try {
        const{
            name,
            type,
            status,
            purchaseDate,
            lastMaintenanceDate,
            nextMaintenanceDate,
            isActive
            }= req.body;
            

            const {id}=req.params


            const machineData={
                   name,
                    type,
                    status,
                    purchaseDate,
                    lastMaintenanceDate,
                    nextMaintenanceDate,
                    isActive
                }
        

        const machine=await MachineModel.findByIdAndUpdate(id,machineData,{ new: true });

        if(!machine)
        {
            console.log("Could not update Machine");
            return res.status(400).send({
                success:false,
                message:"Could not update Machine"
            })
        }

        res.status(200).send({
            success:true,
            message:"Machine Updated Succesfully",
            machine
        })


    } catch (error) {

         console.log("Could not update Machine");
            return res.status(500).send({
                succcess:false,
                message:"Could not update Machine"
            })
        
    }
}