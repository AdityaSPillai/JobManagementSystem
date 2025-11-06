import ShopModel from "../schema/shopSchema.js";

// ➕ Add new machine Category
export const addMachineCategoryController = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { machineCategory } = req.body; // expects { machineCategory: [ { name, hourlyRate } ] }

    if (!shopId)
      return res.status(400).json({ success: false, message: "Shop ID is required" });

    if (!machineCategory || !Array.isArray(machineCategory))
      return res.status(400).json({ success: false, message: "machineCategory must be an array" });

    // ✅ Find the shop first
    const shop = await ShopModel.findById(shopId);
    if (!shop)
      return res.status(404).json({ success: false, message: "Shop not found" });

    // ✅ Push new categories into the nested array
    shop.machineCategory.push(...machineCategory);

    await shop.save();

    res.status(200).json({
      success: true,
      message: "Machine category added successfully",
      machineCategory: shop.machineCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding machine category", error: error.message });
  }
};

// 🧾 Get all machine Category
export const getAllMachineCategoryController = async (req, res) => {
  try {
    const { shopId } = req.params;

    if (!shopId)
      return res.status(400).json({ success: false, message: "Shop ID is required" });

    // ✅ Find the shop and get only the machineCategory field
    const shop = await ShopModel.findById(shopId).select("machineCategory");

    if (!shop)
      return res.status(404).json({ success: false, message: "Shop not found" });

    res.status(200).json({
      success: true,
      machineCategory: shop.machineCategory || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching machine category", error: error.message });
  }
};

// ✏️ Update machine Category
export const updateMachineCategoryController = async (req, res) => {
  try {
    const { shopId, categoryId } = req.params;
    const { name, hourlyRate } = req.body;

    const shop = await ShopModel.findById(shopId);
    if (!shop)
      return res.status(404).json({ success: false, message: "Shop not found" });

    const category = shop.machineCategory.id(categoryId);
    if (!category)
      return res.status(404).json({ success: false, message: "Machine category not found" });

    if (name) category.name = name;
    if (hourlyRate) category.hourlyRate = hourlyRate;

    await shop.save();

    res.status(200).json({
      success: true,
      message: "Machine category updated successfully",
      machineCategory: shop.machineCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating machine category", error: error.message });
  }
};

// 🗑️ Delete machine category
export const deleteMachineCategoryController = async (req, res) => {
  try {
    const { shopId, categoryId } = req.params;

    const shop = await ShopModel.findById(shopId);
    if (!shop)
      return res.status(404).json({ success: false, message: "Shop not found" });

    const category = shop.machineCategory.id(categoryId);
    if (!category)
      return res.status(404).json({ success: false, message: "Machine category not found" });

    category.deleteOne();
    await shop.save();

    res.status(200).json({ success: true, message: "Machine category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting machine category", error: error.message });
  }
};



export const getHourlyRateController= async(req,res)=>{
  try {
    const{type,shopId}=req.params;
    if(!type|| !shopId)
    {
      console.log("Category and  shopId type is required");
    }
    const shop= await ShopModel.findById(shopId);
    if(!shop){
      console.log("Shop not found");
    }

    const category= shop.machineCategory.find(cat=>cat.name===type);
    const rate= category?category.hourlyRate:null;

    res.status(200).send({
      success:true,
      message:"Rate revieved succesfully",
      rate,
    })
    
  } catch (error) {
    
  }
}