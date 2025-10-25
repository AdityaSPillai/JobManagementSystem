import FormTemplateModel from "../schema/formTemplateSchema.js";

export const saveTemplateController= async(req,res)=>{
    try {
    const { templateId, templateData } = req.body;
    
    let template;
    if (templateId) {
      // Update existing template
      template = await FormTemplateModel.findByIdAndUpdate(
        templateId,
        { ...templateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
    } else {
      // Create new template
      template = await FormTemplateModel.create(templateData);
    }
    
    res.status(200).json({
      success: true,
      message: "Template saved successfully",
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getAllTemplates= async(req,res)=>{
  try {
    const templates= await FormTemplateModel.find();
     if(templates.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No templates found"
      })
    }

    res.status(200).send({
      success: true,
      message: "Templates received",
      templates
    })
  } catch (error) {
    console.error("Error fetching templates:", error); // Add this
    return res.status(500).send({
      success: false,
      message: "Unable to fetch templates",
      error: error.message
    }) 
  }
}



export const getActiveTemplate = async (req, res) => {
  try {
    const template = await FormTemplateModel.findOne({ isActive: true });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "No active template found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};






export const setActiveTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    // Deactivate all templates
    await FormTemplateModel.updateMany({}, { isActive: false });
    
    // Activate selected template
    const template = await FormTemplateModel.findByIdAndUpdate(
      templateId,
      { isActive: true },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Template activated successfully",
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



export  const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const template = await FormTemplate.findById(templateId);
    
    if (template.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete active template. Please activate another template first."
      });
    }
    
    await FormTemplate.findByIdAndDelete(templateId);
    
    res.status(200).json({
      success: true,
      message: "Template deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
