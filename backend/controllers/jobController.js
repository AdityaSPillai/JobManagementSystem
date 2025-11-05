import FormTemplateModel from "../schema/formTemplateSchema.js";
import JobCardModel from "../schema/jobCardSchema.js";
import MachineModel from "../schema/machieneModel.js";

let endingtime= new Date();
    function timeDifference(start, end) {
    endingtime= Math.round((end - start) / (1000 * 60)); 
    } ;


export const createJobCard = async (req, res) => {
  try {
    const { templateId,isVerifiedByUser,workVerified,shopId, formData, jobItems } = req.body;
    
    // Validate template exists
    const template = await FormTemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found"
      });
    }

    if(!isVerifiedByUser){
      return res.status(400).json({
        success: false,
        message: "User has not verified the data"
      });
    }
    
    // Calculate total estimated amount (including material costs)
    const totalEstimatedAmount = jobItems.reduce(
      (sum, item) => {
        const itemPrice = item.estimatedPrice || 0;
        const materialPrice = item.material?.estimatedPrice || 0;
        return sum + itemPrice + materialPrice;
      }, 
      0
    );
    
    // Generate job number
    const count = await JobCardModel.countDocuments();
    const jobCardNumber = `JOB-${String(count + 1).padStart(6, '0')}`;
    
    // Create job card
    const jobCard = await JobCardModel.create({
      jobCardNumber,
      templateId,
      shopId,
      isVerifiedByUser,
      workVerified,
      formData: new Map(Object.entries(formData)),
      jobItems: jobItems.map(item => ({
        itemData: new Map(Object.entries(item.itemData || {})),
        estimatedPrice: item.estimatedPrice || 0,
        machine: item.machine || {},
        worker: item.worker || {},
        material: item.material || {}
      })),
      totalEstimatedAmount,
      createdBy: req.user?._id
    });

    // Update machine availability for all machines assigned
    const machineUpdatePromises = jobItems
      .filter(item => item.machine?.machineRequired)
      .map(async (item, index) => {
        try {
          
        
        return MachineModel.findByIdAndUpdate(
          item.machine.machineRequired,
          { 
            isAvailable: false,
            jobId : jobCard._id
          },
          { new: true }
        );
        } catch (error) {
          
        }console.error(`Error updating machine for job item ${index}:`, error);
      });

    await Promise.all(machineUpdatePromises  );

    res.status(201).json({
      success: true,
      message: "Job card created successfully",
      data: jobCard
    });
  } catch (error) {
    console.error("Error creating job card:", error);
    res.status(500).json({
      success: false,
      message: "Error occuerd "+ error.message
    });
  }
};

export const getAllJobs= async(req,res)=>{
    try {
        const jobs=await JobCardModel.find();

        if(jobs.length==0)
        {
            console.log("No jobs added");
            return res.status(400).send({
                success:false,
                message:"No jobs available"
        })
        }

        res.status(200).send({
            success:true,
            message:"All jobs available",
            jobs
        })
        
   } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const updateJobSettings = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { formData, jobItems, status } = req.body;

    const existingJob = await JobCardModel.findById(jobId);
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const updateData = {};

    if (formData) {
      updateData.formData = new Map(Object.entries(formData));
    }

    if (jobItems) {
      const totalEstimatedAmount = jobItems.reduce(
        (sum, item) => {
          const itemPrice = item.estimatedPrice || 0;
          const materialPrice = item.material?.estimatedPrice || 0;
          return sum + itemPrice + materialPrice;
        },
        0
      );

      updateData.jobItems = jobItems.map(item => ({
        itemData: new Map(Object.entries(item.itemData || {})),
        estimatedPrice: item.estimatedPrice || 0,
        machine: item.machine || {},
        worker: item.worker || {},
        material: item.material || {}
      }));

      updateData.totalEstimatedAmount = totalEstimatedAmount;

    
      const oldMachineIds = existingJob.jobItems
        .filter(item => item.machine?.machineRequired)
        .map(item => item.machine.machineRequired);

      if (oldMachineIds.length > 0) {
        await MachineModel.updateMany(
          { _id: { $in: oldMachineIds } },
          { 
            isAvailable: true,
            currentJobId: null
          }
        );
      }

      // Assign new machines
      const newMachineUpdatePromises = jobItems
        .filter(item => item.machine?.machineRequired)
        .map(async (item) => {
          return MachineModel.findByIdAndUpdate(
            item.machine.machineRequired,
            {
              isAvailable: false,
              currentJobId: jobId
            },
            { new: true }
          );
        });

      await Promise.all(newMachineUpdatePromises);
    }

    if (status) {
      updateData.status = status;
    }

    updateData.updatedAt = Date.now();

    // Perform the update
    const updatedJob = await JobCardModel.findByIdAndUpdate(
      jobId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('templateId')
      .populate('createdBy')
      .populate('jobItems.machine.machineRequired')
      .populate('jobItems.worker.workerAssigned');

    if (!updatedJob) {
      return res.status(400).json({
        success: false,
        message: "Unable to update job"
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob
    });

  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred: " + error.message
    });
  }
};





export const deleteJobController= async(req,res)=>{
  try {
    const {jobId}=req.params;

    const job= await JobCardModel.findByIdAndDelete(jobId);

    if(!job)
    {
      console.log("Job was not deleted ");
    }
    
    res.status(200).send({
      success:false,
      message:"Job deleted Succesfully",
      
    })
   } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}



//to operate this controller first provide the jobid of the entire job and not the field id, then add the appropriate machine id to start its timer

export const startMachineForJobItem = async (req, res) => {
  try {
    const { jobId, machineId } = req.params;

    if (!jobId || !machineId) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid jobId and machineId",
      });
    }

    const jobItem = await JobCardModel.findById(jobId);
    if (!jobItem) {
      return res.status(404).json({
        success: false,
        message: "Job item not found",
      });
    }

    let machineFound = false;

    for (const item of jobItem.jobItems) {
      if (item.machine?.machineRequired?.toString() === machineId) {
        item.machine.startTime = new Date();
        machineFound = true;

        // ✅ Update MachineModel as well
        await MachineModel.findByIdAndUpdate(
          machineId,
          {
            isAvailable: false,
            jobId,
            startTime: new Date(),
          },
          { new: true }
        );

        console.log("Machine timer started at", item.machine.startTime);
        break;
      }
    }

    if (!machineFound) {
      return res.status(404).json({
        success: false,
        message: "Machine not found in job items",
      });
    }

    await jobItem.save();

    res.status(200).json({
      success: true,
      message: "Machine timer started successfully",
      jobItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};






//to operate this controller first provide the jobid of the entire job and not the field id, then add the appropriate machine id to start its timer

export const endMachineForJobItem = async (req, res) => {
  try {
    const { jobId, machineId } = req.params;

    if (!jobId || !machineId) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid jobId and machineId",
      });
    }

    const jobItem = await JobCardModel.findById(jobId);
    if (!jobItem) {
      return res.status(404).json({
        success: false,
        message: "Job item not found",
      });
    }

    let machineFound = false;

    for (const item of jobItem.jobItems) {
      if (item.machine?.machineRequired?.toString() === machineId) {
        item.machine.endTime = new Date();
        timeDifference(item.machine.startTime, item.machine.endTime);
        item.machine.actualDuration = endingtime
        machineFound = true;


        // ✅ Update MachineModel as well
        await MachineModel.findByIdAndUpdate(
          machineId,
          {
            isAvailable: true,
            endTime: new Date(),
            actualDuration:endingtime,
            jobId: null,
          },
          { new: true }
        );

        console.log("Machine timer started at", item.machine.startTime);
        break;
      }
    }

    if (!machineFound) {
      return res.status(404).json({
        success: false,
        message: "Machine not found in job items",
      });
    }

    await jobItem.save();

    res.status(200).json({
      success: true,
      message: "Machine timer started successfully",
      jobItem,
    });
  } catch (error) {
    console.error("Error ending machine timer:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};



export const startWorkerTimer= async (req, res) => {
  try {
    const { jobId, userId } = req.params;
  if (!jobId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid jobId and userId",
      });
    } 

    const jobItem = await JobCardModel.findById(jobId);
    if (!jobItem) {
      return res.status(404).json({
        success: false,
        message: "Job item not found",
      });
    } 

console.log(jobItem.status)
    let workerFound = false;

    for (const item of jobItem.jobItems) {
        console.log("worker assigned is ",item.worker?.workerAssigned ,"useriD is",  userId)
      if (item.worker?.workerAssigned?.toString() === userId) {
        item.worker.startTime = new Date();
        workerFound = true; 
        console.log("Worker timer started at", item.worker.startTime);
        break;
      } 
    }

    if (!workerFound) {
      return res.status(404).json({
        success: false,
        message: "Worker not found in job items",
      });
    } 
        jobItem.status="in_progress"

    await jobItem.save();

    res.status(200).json({
      success: true,
      message: "Worker timer started successfully",
      jobItem,
    });


  }
    catch (error) {
      console.error("Error starting worker timer:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  } 
};


export const endWorkerTimer= async (req, res) => {
  try {
    const {jobId,userId} = req.params;
    if(!jobId|| !userId){
      console.error("Please provide valid jobId and userId");
      return res.status(400).json({
        success:false,
        message:"Please provide valid jobId and userId",
      })
    }
    const jobItems=await JobCardModel.findById(jobId);
    if(!jobItems){
      console.error("Job item not found");
      return res.status(404).json({
        success:false,
        message:"Job item not found",
      })
    }

    let workerFound= false;

    for(const item of jobItems.jobItems){
      console.log("Checking workerAssigned:", item.worker?.workerAssigned?.toString(), "against userId:", userId);
      if(item.worker?.workerAssigned?.toString()=== userId){
        item.worker.endTime= new Date();
        timeDifference(item.worker.startTime, item.worker.endTime);
        item.worker.actualDuration= endingtime;
        console.log("Worker timer ended at", item.worker.endTime);
        workerFound= true;
        break;
      }
    }
            jobItems.status="completed"
            await jobItems.save()

    res.status(200).json({
      success: true,
      message: "Worker timer ended successfully",
      jobItems,
    });

if(!workerFound){
      console.error("Worker not found in job items");
      return res.status(404).json({
        success:false,
        message:"Worker not found in job items",
      })
    }


  } catch (error) {
    console.error("Error ending worker timer:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  } 
}


  export const assignWorkerController = async (req, res) => {
  try {
    const { userId, jobId, jobItemId } = req.params;
    
    if (!userId || !jobId || !jobItemId) {
      return res.status(400).send({
        success: false,
        message: "UserID, JobID and JobItemId are required"
      });
    }

    const job = await JobCardModel.findOneAndUpdate(
      { 
        _id: jobId,
        "jobItems._id": jobItemId
      },
      { 
        $set: { "jobItems.$.worker.workerAssigned": userId }
      },
      { new: true }
    );

    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job or job item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Worker assigned successfully",
      data: job
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Unable to assign worker to job",
      error,
    });
  }
};



export const qualityGoodController = async(req,res)=>{
  try {
    const {jobId,userId }= req.params;
   
    const job= await JobCardModel.findOneAndUpdate(
      {
        _id:jobId
      },{
        $set:{workVerified:userId,
          qualityStatus:'good',
          status:'approved',
        }
        },{new:true}
    );
    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job or job item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Status assigned successfully",
      job
    });

    
   } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Unable to assign Quality to job",
      error,
    });
  }
};




export const qualityBadController = async(req,res)=>{
  try {
    const {jobId,userId}= req.params;
    const { notes } = req.body;
    const job=await JobCardModel.findById(jobId)

    job.status='rejected',
    job.qualityStatus='need-work',
    job.notes=notes,
    job.workVerified=userId,
    await job.save();

    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job or job item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Status assigned successfully",
      job
    });

    
   } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Unable to assign Quality to job",
      error,
    });
  }
};
