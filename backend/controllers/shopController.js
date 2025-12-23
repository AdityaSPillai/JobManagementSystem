import MachineModel from "../schema/machieneModel.js";
import ShopModel from "../schema/shopSchema.js";
import UserModel from "../schema/userSchema.js";
import JobCardModel from "../schema/jobCardSchema.js";

export const createShop = async (req, res) => {
  try {
    const {
      shopName,
      ownerId,
      currency,
      categories,
      contactInfo,
      address,
      services,
      machineCategory,
    } = req.body;

    // Validation
    if (!shopName) return res.status(400).send({ success: false, message: "Shop name is required" });
    if (!ownerId) return res.status(400).send({ success: false, message: "Owner ID is required" });
    if (!currency) return res.status(400).send({ success: false, message: "Currency is required" });
    if (!contactInfo || !contactInfo.phone || !contactInfo.email) return res.status(400).send({ success: false, message: "Contact information (phone and email) is required" });
    if (!address || !address.street || !address.city || !address.state || !address.pincode)
      return res.status(400).send({ success: false, message: "Complete address is required" });
    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).send({ success: false, message: "Services must be a non-empty array" });
    }
    if (!Array.isArray(categories) || categories.length === 0) return res.status(400).send({ success: false, message: "categories must be a non-empty array" });
    if (!Array.isArray(machineCategory) || machineCategory.length === 0) return res.status(400).send({ success: false, message: "Machine categories must be a non-empty array" });



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
      currency,
      contactInfo,
      address,
      services,
      categories,
      machineCategory,
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


export const getShop = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await ShopModel.findById(id);
    if (!shop) {
      return res.status(404).send({
        success: false,
        message: "Unable to find the shop with the given id"
      })
    }
    res.status(200).send({
      success: true,
      message: "Shop name recieved successfully",
      shopName: shop.shopName
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to find the shop name",
      error
    })
  }
}

export const updateShopController = async (req, res) => {
  try {
    const { shopId } = req.params;

    const {
      shopName,
      currency,
      phone,
      email,
      street,
      city,
      state,
      pincode,
      logLimit
    } = req.body;

    const updates = {
      ...(shopName && { shopName }),
      ...(currency && { currency }),
      ...(logLimit && { logLimit }),

      contactInfo: {
        ...(phone && { phone }),
        ...(email && { email }),
      },

      address: {
        ...(street && { street }),
        ...(city && { city }),
        ...(state && { state }),
        ...(pincode && { pincode }),
      }
    };

    const shop = await ShopModel.findByIdAndUpdate(shopId, updates, { new: true });

    return res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      shop,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error updating shop",
      error: err.message
    });
  }
};

export const getShopDetails = async (req, res) => {
  try {
    const shop = await ShopModel.findById(req.params.shopId);

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    return res.status(200).json({ success: true, shop });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const addNewService = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { services } = req.body;
    console.log(services);

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





export const updateShopServices = async (req, res) => {
  try {
    const { name, description, note, currency, serviceCategory } = req.body;
    const { shopId, serviceId } = req.params;

    if (!shopId || !serviceId) return res.status(400).json({ success: false, message: "Shop ID  or Serive Id is required" });

    const shop = await ShopModel.findById(shopId);

    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const service = shop.services.id(serviceId);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    if (name) service.name = name;
    if (description) service.description = description;
    if (note) service.note = note;
    if (serviceCategory) service.serviceCategory = serviceCategory;
    if (currency) shop.currency = currency;

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




export const updateCategoryController = async (req, res) => {
  try {
    const { name, hourlyRate, role } = req.body;
    console.log(name, hourlyRate, role);
    const { shopId, categoryId } = req.params;

    if (!shopId || !categoryId) return res.status(400).json({ success: false, message: "Shop ID  or Category Id is required" });

    const shop = await ShopModel.findById(shopId);

    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const categories = shop.categories.id(categoryId);
    if (!categories) return res.status(404).json({ success: false, message: "categories not found" });

    if (name) categories.name = name;
    if (hourlyRate) categories.hourlyRate = hourlyRate;
    if (role) categories.role = role;


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





export const deleteCategoryController = async (req, res) => {
  try {
    const { shopId, categoryId } = req.params;
    if (!shopId || !categoryId) {
      return res.status(404).send({
        succes: false,
        message: "Shop Id and category is required"
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




export const allServices = async (req, res) => {
  try {

    const { shopId } = req.params;
    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required."
      });
    }
    //check if shop is existing
    const shop = await ShopModel.findById(shopId).select("-address -contactInfo -workers");
    if (!shop) {
      console.log("Shop not exisiting");
      return res.status(404).send({
        succes: false,
        message: "Unable to find the shop"
      })
    }

    return res.status(200).send({
      success: true,
      message: "All Services Recieved",
      shop
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to Create Shop services",
      error
    })
  }
}



export const allCategories = async (req, res) => {
  try {



    const { shopId } = req.params;
    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required."
      });
    }
    //check if shop is existing
    const shop = await ShopModel.findById(shopId).select("-address -contactInfo -workers");
    if (!shop) {
      console.log("Shop not exisiting");
      return res.status(404).send({
        succes: false,
        message: "Unable to find the shop"
      })
    }

    return res.status(200).send({
      success: true,
      message: "All Services Recieved",
      categories: shop.categories,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to Create Shop services",
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
      message: "All Employee data recievede Succesfully",
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



export const getAllWorkers = async (req, res) => {
  try {
    //get the Shop iD from params
    const { shopId } = req.params;

    //find users based on the id and role= worker
    const users = await UserModel.find({ shopId: shopId, role: "worker" }).select("-role -shopId -profileImage -createdAt -updatedAt -__v -experience -password");

    if (!users) {
      return res.status(404).send({
        success: false,
        message: "Unable to find the shop with the given userId"
      })
    }

    res.status(200).json({
      success: true,
      message: "All Worker data recievede Succesfully",
      users
    });
  }
  catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to find all the Workers",
      error
    })
  }
}



export const getAllMachineController = async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return res.status(400).send({
        success: false,
        message: "ShopId is required"
      })
    }

    const machines = await MachineModel.find({ shopId: shopId })
    if (!machines) {
      console.log("Cannnot found Machines added for this shop");
      return res.status(404).send({ success: false, message: "Unable to find Machines added for this shop" })
    }

    res.status(200).send({
      success: true,
      message: "All machines Found Succesfully",
      machines
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to find all the Machines",
      error
    })
  }
}


export const getAllShopJobsController = async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return res.status(400).send({
        success: false,
        message: "ShopId is required"
      })
    }

    const allJobs = await JobCardModel.find({ shopId: shopId }).populate('jobItems.machine.machineRequired', 'name').sort({ createdAt: -1 })
    if (!allJobs) {
      return res.status(404).send({
        succes: false,
        message: "Unable to find Jobs from that shop"
      })
    }

    if (allJobs.length == 0) {
      return res.status(400).send
        ({
          succes: false,
          message: "NO employee found for this shop "
        })
    }

    res.status(200).send({
      succes: true,
      message: "All jobs recieved",
      allJobs
    })

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to find the Jobs",
      error
    })
  }
}



export const getServiceCategory= async(req,res)=>{
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return res.status(400).send({
        success: false,
        message: "ShopId is required"
      })
    }

    const shop = await ShopModel.findById(shopId).select("serviceCategory");
    if (!shop) {
      return res.status(404).send({
        succes: false,
        message: "Unable to find shop"
      })
    }

    res.status(200).send({
      success: true,
      message: "All Service Categories found",
      serviceCategory: shop.serviceCategory
    });

 } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to find the All Service Categories",
      error
    })
  }
}


export const createServiceCategory= async(req,res)=>{
  try {

    const { shopId } = req.params;
    const { name } = req.body;
    if (!shopId) {
      return res.status(400).send({
        success: false,
        message: "ShopId is required"
      })
    }
    const shop = await ShopModel.findById(shopId);
    if (!shop) {
      return res.status(404).send({
        succes: false,
        message: "Unable to find shop"
      })
    }
    shop.serviceCategory.push({name});
    await shop.save();

    res.status(200).send({
      success: true,
      message: "New Service Category created successfully",
      serviceCategory: shop.serviceCategory
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to Create new Service Categories",
      error
    })
  }
}



export const updateServiceCategories= async(req,res)=>{
  try {
    const { shopId, categoryId } = req.params;
    const { name } = req.body;
    if (!shopId || !categoryId) {
      return res.status(400).send({
        success: false,
        message: "ShopId and CategoryId is required"
      })
    }
    const shop = await ShopModel.findById(shopId);
    if (!shop) {
      return res.status(404).send({
        succes: false,
        message: "Unable to find shop"
      })
    }
    const category = shop.serviceCategory.id(categoryId);
    if (!category) {
      return res.status(404).send({
        succes: false,
        message: "Unable to find category"
      })
    }
    if (name) category.name = name;
    await shop.save();

    res.status(200).send({
      success: true,
      message: "Service Category updated successfully",
      serviceCategory: shop.serviceCategory
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to update Service Category",
      error
    });
  }
}


export const deleteServiceCategories = async (req, res) => {
  try {
    const { shopId, categoryId } = req.params;
    if (!shopId || !categoryId) {
      return res.status(400).send({
        success: false,
        message: "ShopId and CategoryId is required"
      });
    }
    const shop = await ShopModel.findById(shopId);
    if (!shop) {
      return res.status(404).send({
        success: false,
        message: "Unable to find shop"
      });
    }
    const category = shop.serviceCategory.id(categoryId);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Unable to find category"
      });
    }
    category.deleteOne();
    await shop.save();
    res.status(200).send({
      success: true,
      message: "Service Category deleted successfully",
      serviceCategory: shop.serviceCategory
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Unable to delete Service Category",
      error
    });
  }
};


export const getAllClient = async (req, res) => {
  try {
    const { shopId } = req.params;

    const jobs = await JobCardModel.find({ shopId });
    console.log(jobs.length)

    if (!jobs || jobs.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No jobs found for this shop"
      });
    }
    console.log(jobs.length)
    // Extract customer info from each job
    const allClients = jobs.map(job => {
      const form = job.formData instanceof Map
        ? Object.fromEntries(job.formData)
        : job.formData || {};

      return {
        customer_name: form.customer_name || "Unknown",
        contact_number: form.contact_number || "",
        vehicle_number: form.vehicle_number || "",
        vehicle_model: form.vehicle_model || "",
        status: job.status || '',
      };
    });

    // Remove duplicates based on contact number (or name if you prefer)
    const uniqueClients = [];
    const seen = new Set();

    for (const client of allClients) {
      const key = client.contact_number || client.customer_name; // use unique field
      if (!seen.has(key)) {
        seen.add(key);
        uniqueClients.push(client);
      }
    }



    return res.status(200).send({
      success: true,
      message: "Clients fetched successfully",
      clients: uniqueClients
    });

  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).send({
      success: false,
      message: "Unable to fetch clients",
      error
    });
  }
};

// Add new consumables
export const addConsumablesController = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { consumables } = req.body;

    if (!shopId || !Array.isArray(consumables)) {
      return res.status(400).json({ success: false, message: "Shop ID and consumables array required" });
    }

    const shop = await ShopModel.findById(shopId);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    shop.consumables.push(...consumables);
    await shop.save();

    res.status(200).json({
      success: true,
      message: "Consumables added successfully",
      consumables: shop.consumables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding consumables",
      error: error.message
    });
  }
};

// Get all consumables
export const getAllConsumablesController = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await ShopModel.findById(shopId).select("consumables");

    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    res.status(200).json({
      success: true,
      consumables: shop.consumables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching consumables",
      error: error.message
    });
  }
};

// Update consumable
export const updateConsumableController = async (req, res) => {
  try {
    const { shopId, consumableId } = req.params;
    const { name, price, available, quantity, unitOfMeasure } = req.body;

    const shop = await ShopModel.findById(shopId);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const item = shop.consumables.id(consumableId);
    if (!item) return res.status(404).json({ success: false, message: "Consumable not found" });

    if (name) item.name = name;
    if (price !== undefined) item.price = price;
    if (available !== undefined) item.available = available;
    if (unitOfMeasure !== undefined) item.unitOfMeasure = unitOfMeasure;
    if (quantity !== undefined) item.quantity = quantity;

    await shop.save();

    res.status(200).json({
      success: true,
      message: "Consumable updated successfully",
      consumables: shop.consumables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating consumable",
      error: error.message
    });
  }
};

// Delete consumable
export const deleteConsumableController = async (req, res) => {
  try {
    const { shopId, consumableId } = req.params;
    const shop = await ShopModel.findById(shopId);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const item = shop.consumables.id(consumableId);
    if (!item) return res.status(404).json({ success: false, message: "Consumable not found" });

    item.deleteOne();
    await shop.save();

    res.status(200).json({
      success: true,
      message: "Consumable deleted successfully",
      consumables: shop.consumables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting consumable",
      error: error.message
    });
  }
};

export const addLog = async (shopId, logData) => {
  try {
    const shop = await ShopModel.findById(shopId);
    if (!shop) return;

    const limit = shop.logLimit || 1000;

    // FIFO: remove oldest when exceeding
    if (shop.logs.length >= limit) {
      shop.logs.shift();
    }

    shop.logs.push({
      ...logData,
      timestamp: new Date()
    });

    await shop.save();
  } catch (err) {
    console.error("Log Insert Error:", err.message);
    res.status(500).send({
      success: false,
      message: "Unable to Insert.",
      err,
    })
  }
};

// GET LOGS
export const getLogs = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await ShopModel.findById(shopId).select("logs");
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    res.status(200).json({
      success: true,
      logs: shop.logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching logs" });
  }
};

// UPDATE LOG LIMIT
export const updateLogLimit = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { limit } = req.body;

    const shop = await ShopModel.findById(shopId);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    shop.logLimit = limit;
    await shop.save();

    res.status(200).json({ success: true, message: "Log limit updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to update log limit" });
  }
};


export const getManPowerHourlyRateController = async (req, res) => {
  try {
    const { type, shopId } = req.params;

    if (!type || !shopId) {
      return res.status(400).json({
        success: false,
        message: "Category name and shopId are required",
      });
    }

    const shop = await ShopModel.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // ✅ MATCH BY CATEGORY NAME (CASE-SAFE)
    const category = shop.categories.find(
      cat => cat.name.toLowerCase() === type.toLowerCase()
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category '${type}' not found in shop`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Man power hourly rate retrieved successfully",
      rate: category.hourlyRate,
      categoryName: category.name,
    });

  } catch (error) {
    console.error("Error fetching man power hourly rate:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching man power hourly rate",
      error: error.message,
    });
  }
};