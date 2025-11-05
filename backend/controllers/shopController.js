import MachineModel from "../schema/machieneModel.js";
import ShopModel from "../schema/shopSchema.js";
import UserModel from "../schema/userSchema.js";
import JobCardModel from "../schema/jobCardSchema.js";

export const createShop = async (req, res) => {
  try {
    const {
      shopName,
      ownerId,
      // categories,
      contactInfo,
      address,
      services,
    } = req.body;

    // Validation
    if (!shopName)  return res.status(400).send({ success: false, message: "Shop name is required"});
    if (!ownerId) return res.status(400).send({ success: false, message: "Owner ID is required" });
    if (!contactInfo || !contactInfo.phone || !contactInfo.email) return res.status(400).send({success: false,  message: "Contact information (phone and email) is required" });
    if (!address || !address.street || !address.city || !address.state || !address.pincode)
  return res.status(400).send({ success: false, message: "Complete address is required" });
if (!Array.isArray(services) || services.length === 0) {
  return res.status(400).send({ success: false, message: "Services must be a non-empty array" });
}
// if(!Array.isArray(categories)|| categories.length===0)   return res.status(400).send({ success: false, message: "categories must be a non-empty array" });



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
const existingShop = await ShopModel.findOne({
  ownerId,
  "address.city": address.city,
  "address.pincode": address.pincode
});
    if (existingShop) {
      return res.status(400).send({
        success: false,
        message: "Owner already has a shop registered in that location please try agaain"
      });
    }

    // Create new shop
    const shop = new ShopModel({
      shopName,
      ownerId,
      contactInfo,
      address,
      services,
     // categories
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




export const addNewService= async(req,res)=>{
  try {
    const { shopId } = req.params;
    const { services } = req.body;

    if (!shopId) return res.status(400).json({ success: false, message: "Shop ID is required" });
    if (!services || !Array.isArray(services))
      return res.status(400).json({ success: false, message: "Services must be an array" });

    const shop = await ShopModel.findById(shopId);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    shop.services.push(...services);
    await shop.save();

    res.status(200).json({
      success: true,
      message: "Services added successfully",
      services: shop.services,
    });
 } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error Adding new services ",
      error: error.message
    });
  }
};

// {
// "services":[{
//     "name":"brake_service",
//     "description":"Change the Break pad ",
//     "price":1000
// }]
// }




export const addNewCategoryController = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { categories } = req.body;

    if (!shopId)
      return res
        .status(400)
        .json({ success: false, message: "Shop ID is required" });

    if (!categories || !Array.isArray(categories))
      return res
        .status(400)
        .json({ success: false, message: "Categories must be an array" });

    const shop = await ShopModel.findById(shopId);
    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });

    const newCategories = categories.filter(
      (cat) => !shop.categories.includes(cat)
    );

    shop.categories.push(...newCategories);
    await shop.save();

    res.status(200).json({
      success: true,
      message: "Categories added successfully",
      categories: shop.categories,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({
      success: false,
      message: "Error adding new category",
      error: error.message,
    });
  }
};


// {
//   "categories": [
//     {
//       "name": "General",
//       "hourlyRate": 200
//     }
//   ]
// }





export const updateShopServices= async(req,res)=>{
  try {
    const { name, description, price,note} = req.body;
    const {shopId,serviceId}=req.params;

    if (!shopId|| !serviceId) return res.status(400).json({ success: false, message: "Shop ID  or Serive Id is required" });

    const shop = await ShopModel.findById(shopId);

    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const service = shop.services.id(serviceId);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    if (name) service.name = name;
    if (description) service.description = description;
    if (price !== undefined) service.price = price;
    if(note) service.note=note;

    await shop.save();

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      services: shop.services,
    });

    
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error updating service ",
      error: error.message
    });
  }
};


// {
//     "price":2000,
//     "description":"Change the Engine Oil"
// }




export const updateCategoryController=async(req,res)=>{
 try {
    const { name, hourlyRate} = req.body;
    const {shopId,categoryId}=req.params;

    if (!shopId|| !categoryId) return res.status(400).json({ success: false, message: "Shop ID  or Category Id is required" });

    const shop = await ShopModel.findById(shopId);

    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const categories = shop.categories.id(categoryId);
    if (!categories) return res.status(404).json({ success: false, message: "categories not found" });

    if (name) categories.name = name;
    if (hourlyRate) categories.hourlyRate = hourlyRate;
  

    await shop.save();

    res.status(200).json({
      success: true,
      message: "categories updated successfully",
      categories: shop.categories,
    });

    
    
   } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error updating Category ",
      error: error.message
    });
  }
};


// {
//       "name": "General",
//       "hourlyRate": 250
//     }
 




export const deleteShopService = async (req, res) => {
  try {
    const { shopId, serviceId } = req.params;

    if (!shopId || !serviceId) {
      return res.status(400).send({
        success: false,
        message: "Shop ID or Service ID not provided",
      });
    }

    // Find the shop
    const shop = await ShopModel.findById(shopId);
    if (!shop) {
      return res.status(404).send({
        success: false,
        message: "Shop not found",
      });
    }

    // Find the service inside the shop
    const service = shop.services.id(serviceId);
    if (!service) {
      return res.status(404).send({
        success: false,
        message: "Service not found in this shop",
      });
    }

    // Remove the service
    service.deleteOne();

    // Save the shop after removal
    await shop.save();

    res.status(200).send({
      success: true,
      message: "Service deleted successfully",
      shop,
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).send({
      success: false,
      message: "Unable to delete service",
      error: error.message,
    });
  }
};





export const deleteCategoryController= async(req,res)=>{
  try {
        const {shopId,categoryId}=req.params;
      if(!shopId || !categoryId){
        return res.status(404).send({
          succes:false,
          message:"Shop Id and category is required"
        })
      }
       const shop = await ShopModel.findById(shopId);
    if (!shop) {
      return res.status(404).send({
        success: false,
        message: "Shop not found",
      });
    }

    // Find the service inside the shop
    const category = shop.categories.id(categoryId);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "category not found in this shop",
      });
    }
    category.deleteOne();

    // Save the shop after removal
    await shop.save();

    res.status(200).send({
      success: true,
      message: "category deleted successfully",
      shop,
    });

    
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).send({
      success: false,
      message: "Unable to delete category",
      error: error.message,
    });
  }
};




export const allServices=async(req,res)=>{
    try {

    const {shopId}=req.params;
     if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required."
      });
    }
      //check if shop is existing
      const shop= await ShopModel.findById(shopId).select("-address -contactInfo -workers");
      if(!shop)
      {
        console.log("Shop not exisiting");
        return res.status(404).send({
          succes:false,
          message:"Unable to find the shop"
        })
      }

      return res.status(200).send({
        success:true,
        message:"All Services Recieved",
        shop
      });
      
  } catch (error) {
    res.status(500).send({
      success:false,
      message:"Unable to Create Shop services",
      error
    })
  }
}



export const allCategories=async(req,res)=>{
 try {

    const {shopId}=req.params;
     if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required."
      });
    }
      //check if shop is existing
      const shop= await ShopModel.findById(shopId).select("-address -contactInfo -workers");
      if(!shop)
      {
        console.log("Shop not exisiting");
        return res.status(404).send({
          succes:false,
          message:"Unable to find the shop"
        })
      }

      return res.status(200).send({
        success:true,
        message:"All Services Recieved",
        categories:shop.categories,
      });
      
  } catch (error) {
    res.status(500).send({
      success:false,
      message:"Unable to Create Shop services",
      error
    })
  }
}



export const getAllEmployees = async (req, res) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required."
      });
    }

    const users = await UserModel.find({ shopId });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No employees registered for this shop."
      });
    }

    res.status(200).json({
      success: true,
      message:"All Employee data recievede Succesfully",
      users
    });

  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Unable to find all workers",
      error: error.message
    });
  }
};



export const getAllWorkers=async(req,res)=>{
  try {
    //get the Shop iD from params
    const  {shopId}= req.params;

      //find users based on the id and role= worker
    const users= await UserModel.find({shopId:shopId, role:"worker"}).select("-role -shopId -profileImage -createdAt -updatedAt -__v -experience -password");

    if(!users){
      return res.status(404).send({
        success:false,
        message:"Unable to find the shop with the given userId"
      })
    }

 res.status(200).json({
      success: true,
      message:"All Worker data recievede Succesfully",
      users
    });  }
     catch (error) {
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
  }  catch (error) {
    res.status(500).send({
      success:false,
      message:"Unable to find all the Machines",
      error
    })
  }
}


export const getAllShopJobsController= async(req,res)=>{
  try {
    const{shopId}=req.params;
    if(!shopId)
     {
      return res.status(400).send({
        success:false,
        message:"ShopId is required"
      })
    }

    const allJobs=await JobCardModel.find({shopId:shopId}).populate('jobItems.machine.machineRequired', 'name')
    if(!allJobs)
    {
      return res.status(404).send({
        succes:false,
        message:"Unable to find Jobs from that shop"
      })
    }

    if(allJobs.length==0)
    {
      return res.status(400).send
      ({
        succes:false,
        message:"NO employee found for this shop "
      })
    }

    res.status(200).send({
      succes:true,
      message:"All jobs recieved",
      allJobs
    })

  }  catch (error) {
    res.status(500).send({
      success:false,
      message:"Unable to find the Jobs",
      error
    })
  }
}



