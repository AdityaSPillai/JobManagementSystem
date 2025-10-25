import e from "express";
import MachineModel from "../schema/machieneModel.js";
import ShopModel from "../schema/shopSchema.js";
import UserModel from "../schema/userSchema.js";

export const createShop = async (req, res) => {
  try {
    const {
      shopName,
      ownerId,
      contactInfo,
      address,
    } = req.body;

    // Validation
    if (!shopName)  return res.status(400).send({ success: false, message: "Shop name is required"});
    if (!ownerId) return res.status(400).send({ success: false, message: "Owner ID is required" });
    if (!contactInfo || !contactInfo.phone || !contactInfo.email) return res.status(400).send({success: false,  message: "Contact information (phone and email) is required" });
    if (!address || !address.street || !address.city || !address.state || !address.pincode) return res.status(400).send({success: false,});
   

    // Check if owner exists and has owner role
    const owner = await UserModel.findById(ownerId);
    if (!owner) {
      return res.status(404).send({
        success: false,
        message: "Owner not found"
      });
    }
    if (owner.role !== 'owner') {
      return res.status(403).send({
        success: false,
        message: "User is not an owner"
      });
    }

    // Check if shop already existing based on the address given 
    const existingShop = await ShopModel.findOne({address:address});
    if (existingShop) {
      return res.status(400).send({
        success: false,
        message: "Owner already has a shop registered in that location please try agaain"
      });
    }

    // Create new shop
    const shop = new ShopModelz({
      shopName,
      ownerId,
      contactInfo,
      address,
    
    });

    await shop.save();

    // Update owner's shopId
    owner.shopId = shop._id;
    await owner.save();

    res.status(201).send({
      success: true,
      message: "Shop created successfully",
      shop
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error creating shop",
      error: error.message
    });
  }
};




export const getAllEmployees= async(req,res)=>{
  try {
        //get the Shop iD from params

    const  {shopId}= req.params;


    const users= await UserModel.find({shopId:shopId});

    if(!users){
      return res.status(404).send({
        success:false,
        message:"Unable to find the shop with the given userId"
      })
    }

    res.status(200).json(users);
  
  } catch (error) {
    console.error(error);
    res.status(500).send({
     success:false,
     message:"Unable to find all workers",
     error
     }
    )
  }
}


export const getAllWorkers=async(req,res)=>{
  try {
    //get the Shop iD from params
    const  {shopId}= req.params;

      //find users based on the id and role= worker
    const users= await UserModel.find({shopId:shopId, role:"worker"}).select("-role -shopId -profileImage -createdAt -updatedAt -__v -experience");

    if(!users){
      return res.status(404).send({
        success:false,
        message:"Unable to find the shop with the given userId"
      })
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).send({
      success:false,
      message:"Unable to find all the Workers",
      error
    })
  }
}



export const getAllMachineController= async(req,res)=>{
  try {
    const  {shopId}= req.params;
    if(!shopId)
    {
      return res.status(400).send({
        success:false,
        message:"ShopId is required"
      })
    }

    const machines= await MachineModel.find({shopId:shopId})
    if(!machines)
    {
      console.log("Cannnot found Machines added for this shop");
      return res.status(404).send({success:false,message:"Unable to find Machines added for this shop"})
    }

    res.status(200).send({
      success:true,
      message:"All machines Found Succesfully",
      machines
    })
  } catch (error) {
    
  }
}