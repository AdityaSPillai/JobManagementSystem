import mongoose from "mongoose";
import FormTemplateModel from "../schema/formTemplateSchema.js";
import JobCardModel from "../schema/jobCardSchema.js";
import MachineModel from "../schema/machieneModel.js";

let endingtime= new Date();
    function timeDifference(start, end) {
    endingtime= Math.round((end - start) / (1000 * 60)); 
    } ;


export const createJobCard = async (req, res) => {
  try {
    const { templateId,workVerified,shopId, formData, jobItems } = req.body;
    
    // Validate template exists
    const template = await FormTemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found"
      });
    }


    const totalEstimatedAmount = jobItems.reduce(
      (sum, item) => {
        const itemPrice = item.estimatedPrice || 0;
        const consumablePrice = Array.isArray(item.consumable)
          ? item.consumable.reduce((sum, c) => sum + (c.price || 0), 0)
          : 0;
        const machineCost = item.machineEstimatedCost || 0;
        return sum + itemPrice + consumablePrice + machineCost;
      },
      0
    );
    
    // Generate job number
    const count = await JobCardModel.countDocuments();
 
// Generate job number with date and time
const now = new Date();
const formattedDate = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 12);
const jobCardNumber = `JOB-${formattedDate}-${String(count + 1).padStart(6, '0')}`;
    
    // Create job card
    const jobCard = await JobCardModel.create({
      jobCardNumber,
      templateId,
      shopId,
      isVerifiedByUser:false,
      workVerified,
      formData: new Map(Object.entries(formData)),
      jobItems: jobItems.map(item => ({
        itemData: new Map(Object.entries(item.itemData || {})),
        category:item.category,
        estimatedManHours:item.estimatedManHours,
        estimatedPrice: item.estimatedPrice || 0,
        machine: item.machine || {},
        worker: item.worker || {},
        consumable: Array.isArray(item.consumable) ? item.consumable : [],
      })),
      status:'waiting',
      totalEstimatedAmount,
      createdBy: req.user?._id
    });

    // Update machine availability for all machines assigned
    const machineUpdatePromises = jobItems
    .filter(item => item.machine?.machineRequired && item.machine.machineRequired !== null)
    .map(async (item, index) => {
      try {
        if (mongoose.isValidObjectId(item.machine.machineRequired)) {
          return MachineModel.findByIdAndUpdate(
            item.machine.machineRequired,
            { 
              isAvailable: false,
              jobId: jobCard._id
            },
            { new: true }
          );
        }
      } catch (error) {
        console.error(`Error updating machine for job item ${index}:`, error);
      }
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
        message: "Job not found",
      });
    }

    const updateData = {};

    if (formData) {
      updateData.formData = new Map(Object.entries(formData));
    }

    if (jobItems) {
      // ✅ Match total cost calculation from createJobCard
      const totalEstimatedAmount = jobItems.reduce((sum, item) => {
        const itemPrice = item.estimatedPrice || 0;
        const consumablePrice = Array.isArray(item.consumable)
          ? item.consumable.reduce((cSum, c) => cSum + (c.price || 0), 0)
          : 0;
        const machineCost = item.machineEstimatedCost || 0;
        return sum + itemPrice + consumablePrice + machineCost;
      }, 0);

      // ✅ Maintain same item structure as createJobCard
      updateData.jobItems = jobItems.map((item) => ({
        itemData: new Map(Object.entries(item.itemData || {})),
        category: item.category,
        estimatedManHours: item.estimatedManHours,
        estimatedPrice: item.estimatedPrice || 0,
        machine: item.machine || {},
        worker: item.worker || {},
        consumable: Array.isArray(item.consumable) ? item.consumable : [],
      }));

      updateData.totalEstimatedAmount = totalEstimatedAmount;

      // ✅ Restore old machines
      const oldMachineIds = existingJob.jobItems
        .filter((item) => item.machine?.machineRequired)
        .map((item) => item.machine.machineRequired);

      if (oldMachineIds.length > 0) {
        await MachineModel.updateMany(
          { _id: { $in: oldMachineIds } },
          {
            isAvailable: true,
            jobId: null,
          }
        );
      }

      // ✅ Assign new machines
      const newMachineUpdatePromises = jobItems
        .filter((item) => item.machine?.machineRequired)
        .map(async (item) => {
          return MachineModel.findByIdAndUpdate(
            item.machine.machineRequired,
            {
              isAvailable: false,
              jobId,
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

    // ✅ Perform the update
    const updatedJob = await JobCardModel.findByIdAndUpdate(jobId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("templateId")
      .populate("createdBy")
      .populate("jobItems.machine.machineRequired")
      .populate("jobItems.worker.workerAssigned");

    if (!updatedJob) {
      return res.status(400).json({
        success: false,
        message: "Unable to update job",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred: " + error.message,
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
      success:true,
      message:"Job deleted Succesfully",
      job
      
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



export const startWorkerTimer = async (req, res) => {
  try {
    const { jobId, jobItemId, workerObjectId } = req.params;

    if (!jobId || !jobItemId || !workerObjectId) {
      return res.status(400).json({
        success: false,
        message: "jobId, jobItemId and workerObjectId are required"
      });
    }

    const job = await JobCardModel.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const jobItem = job.jobItems.find(i => i._id.toString() === jobItemId);
    if (!jobItem) {
      return res.status(404).json({ success: false, message: "Job item not found" });
    }
    console.log("Job Item found:", jobItem.workers);  

    const worker = jobItem.workers.find(w => w.workerAssigned.toString() === workerObjectId);
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    
    worker.startTime = new Date();
    jobItem.status = "in_progress";

    await job.save();

    res.status(200).json({
      success: true,
      message: "Worker timer started",
      worker
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const pauseWrokerTImer= async (req, res) => {
  try {
      const {jobId,jobItemId,workerObjectId} = req.params;
    if(!jobId|| !jobItemId|| !workerObjectId){
      console.error("Please provide valid jobId and userId and workerObjectId");
      return res.status(400).json({
        success:false,
        message:"Please provide valid jobId and userId",
      })
    }
    const job=await JobCardModel.findById(jobId);
    if(!job){
      console.error("Job item not found");
      return res.status(404).json({
        success:false,
        message:"Job item not found",
      })
    }

    const jobItem=job.jobItems.find(i=>i._id.toString()===jobItemId);
    if(!jobItem){
      return res.status(404).json({
        success: false,
        message: "Job item not found",
      });
    }
    console.log("Job Item found:", jobItem.workers);
    let workerFound= false;
for(const worker of jobItem.workers){
      console.log("Checking workerAssigned:", worker?.workerAssigned?.toString());
      if(worker?.workerAssigned?.toString()=== workerObjectId){
        worker.endTime= new Date();
        timeDifference(worker.startTime, worker.endTime);
        worker.actualDuration += endingtime;
        console.log("Worker timer ended at", worker.endTime);
        worker.endTime= null;
        worker.startTime=null;

        workerFound= true;
        jobItem.status='completed';
        break;
      }
    }

 await job.save()
        if(!workerFound){
              console.error("Worker not found in job items");
              return res.status(404).json({
                success:false,
                message:"Worker not found in job items",
              })
            }

     res.status(200).json({
      success: true,
      message: "Worker timer ended successfully",
      job,
    });



  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const endWorkerTimer= async (req, res) => {
  try {
    const {jobId,jobItemId,workerObjectId} = req.params;
    if(!jobId|| !jobItemId|| !workerObjectId){
      console.error("Please provide valid jobId and userId and workerObjectId");
      return res.status(400).json({
        success:false,
        message:"Please provide valid jobId and userId",
      })
    }
    const job=await JobCardModel.findById(jobId);
    if(!job){
      console.error("Job item not found");
      return res.status(404).json({
        success:false,
        message:"Job item not found",
      })
    }

    const jobItem=job.jobItems.find(i=>i._id.toString()===jobItemId);
    if(!jobItem){
      return res.status(404).json({
        success: false,
        message: "Job item not found",
      });
    }

    let workerFound= false;
    

    for(const worker of jobItem.workers){
      console.log("Checking workerAssigned:", worker?.workerAssigned?.toString());
      if(worker?.workerAssigned?.toString()=== workerObjectId){
        worker.endTime= new Date();
        timeDifference(worker.startTime, worker.endTime);
        worker.actualDuration += endingtime;
        console.log("Worker timer ended at", worker.endTime);
        workerFound= true;
        break;
      }

    } 
    let completed=false;
    for(const w of jobItem.workers){
      console.log("Worker actual duration: ", w.actualDuration + "\n");
        if(w.actualDuration !== null && w.actualDuration >0){
          completed=true;
        }
    }

    if(completed){
      jobItem.status='completed';
    }



    let notCompleted=false;
    for(let jobs of job.jobItems  ) {

      console.log("Checking job item status: of ", jobs.status + "\n");
        if(jobs.status !== 'completed'){
          notCompleted=true;
          break;
        }
        else{
          notCompleted=false;
        }
    }
console.log("Not completed status:", notCompleted);
    if(!notCompleted){
      job.status='completed'
    }

      await job.save()
        if(!workerFound){
              console.error("Worker not found in job items");
              return res.status(404).json({
                success:false,
                message:"Worker not found in job items",
              })
            }

     res.status(200).json({
      success: true,
      message: "Worker timer ended successfully",
      job,
    });


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

    const workObject={
      workerAssigned:userId,
      startTime:null,
      endTime:null,
      actualDuration:null
    }

    const job = await JobCardModel.findOneAndUpdate(
      { 
        _id: jobId,
        "jobItems._id": jobItemId
      },
      { 
        $addToSet: { "jobItems.$.workers":workObject }
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



export const verifyJobController =async(req,res)=>{
 
     try {
    const { jobId } = req.params;
  if (!jobId ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid jobId and ",
      });
    } 

    const jobItem = await JobCardModel.findById(jobId);
    if (!jobItem) {
      return res.status(404).json({
        success: false,
        message: "Job item not found",
      });
    } 

    console.log(jobItem)
    jobItem.isVerifiedByUser=true;
    jobItem.status='pending';
    await jobItem.save();
    res.status(200).send({
      success:true,
      message:"Job verified succesfylly",
      jobItem
    })

    
    } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Unable to Verify job as user agreed",
      error,
    });
  }
}