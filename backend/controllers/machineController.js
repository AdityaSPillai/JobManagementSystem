import MachineModel from "../schema/machieneModel.js";
import ShopModel from "../schema/shopSchema.js";

export const createMachineController = async (req, res) => {
  try {
    const {
      name,
      machineId,
      type,
      status,
      hourlyRate,
      purchaseDate,
      lastMaintenanceDate,
      nextMaintenanceDate,
      isActive,
      startTime,
      endTime,
      actualDuration,
      userId, // owner id
      shopId // new: directly send shopId from frontend
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: "Name and type are required" });
    }

    // ✅ find the shop by shopId (not ownerId)
    const shop = await ShopModel.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    // ✅ optional: check if type matches one of shop's machineCategory
    const validCategory = shop.machineCategory.find(cat => cat.name === type);
    if (!validCategory) {
      return res.status(400).json({ success: false, message: "Invalid machine category selected" });
    }

    // ✅ create new machine entry
    const machine = new MachineModel({
      name,
      machineId,
      type,
      hourlyRate,
      status,
      purchaseDate,
      lastMaintenanceDate,
      nextMaintenanceDate,
      isActive,
      shopId,
      startTime,
      endTime,
      actualDuration,
    });

    await machine.save();

    return res.status(200).json({
      success: true,
      message: "Machine created successfully",
      machine,
    });
  } catch (error) {
    console.error("❌ Error creating machine:", error);
    res.status(500).json({
      success: false,
      message: error.errorResponse.errmsg.slice(0,20) || "Error in creating Machine",
      error: error.message,
    });
  }
};


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


export const updateMachineController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Machine ID is required" });
    }

    // ✅ Normalize input safely
    let {
      name,
      type,
      machineId,
      status,
      hourlyRate,
      purchaseDate,
      lastMaintenanceDate,
      nextMaintenanceDate,
      isActive
    } = req.body;

    // Convert string booleans → real booleans
    if (typeof status === "string") status = status === "true";
    if (typeof isActive === "string") isActive = isActive === "true";

    // Build update object — only include defined fields
    const machineData = {};
    if (name !== undefined) machineData.name = name;
    if (machineId !== undefined) machineData.machineId = machineId;
    if (type !== undefined) machineData.type = type;
    if (hourlyRate !== undefined) machineData.hourlyRate = hourlyRate;
    if (status !== undefined) machineData.status = status;
    if (purchaseDate) machineData.purchaseDate = purchaseDate;
    if (lastMaintenanceDate) machineData.lastMaintenanceDate = lastMaintenanceDate;
    if (nextMaintenanceDate) machineData.nextMaintenanceDate = nextMaintenanceDate;
    if (isActive !== undefined) machineData.isActive = isActive;

    // ✅ Perform the update
    const updatedMachine = await MachineModel.findByIdAndUpdate(id, machineData, { new: true, runValidators: true });

    if (!updatedMachine) {
      console.log("❌ Could not find machine to update");
      return res.status(404).json({ success: false, message: "Machine not found" });
    }

    console.log("✅ Machine updated successfully:", updatedMachine._id);

    res.status(200).json({
      success: true,
      message: "Machine updated successfully",
      machine: updatedMachine
    });
  } catch (error) {
    console.error("❌ Error updating machine:", error);
    res.status(500).json({
      success: false,
      message: "Error updating machine",
      error: error.message,
    });
  }
};

export const deleteMachineController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Machine ID is required" });
    }

    const deletedMachine = await MachineModel.findByIdAndDelete(id);

    if (!deletedMachine) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }

    res.status(200).json({
      success: true,
      message: "Machine deleted successfully",
      deletedMachine
    });
  } catch (error) {
    console.error("❌ Error deleting machine:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting machine",
      error: error.message,
    });
  }
};