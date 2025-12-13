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
       const machineCost= Array.isArray(item.machine)?
       item.machine.reduce((sum,m)=> sum+m.machineEstimatedCost||0,0):0;
             return sum + itemPrice + consumablePrice + machineCost

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
        numberOfWorkers:item.numberOfWorkers,
        estimatedPrice: item.estimatedPrice || 0,
       machine: Array.isArray(item.machine) 
          ? item.machine.map(m => ({
              machineRequired: m.machineRequired || null,
              startTime: m.startTime || null,
              endTime: m.endTime || null,
              actualDuration: m.actualDuration || null
            }))
          : [],

        workers: Array.isArray(item.workers) ? item.workers : [],
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


    const MachineUpdatePromise= [];
    jobItems.forEach((item,itemIndex)=>{
          console.log(item.machine)

      if(Array.isArray(item.machine)){
        item.machine.forEach((machine, machineIndex) => {
        if(machine.machineRequired && machine.machineRequired !== null){
          machineUpdatePromises.push(
            MachineModel.findByIdAndUpdate(machine.machineRequired,{  isAvailable: false,  jobId: jobCard._id },{new:true})
            .catch(error => {
                console.error(
                  `Error updating machine ${machine.machineRequired} for job item ${itemIndex}, machine ${machineIndex}:`, 
                  error
                );
                return null; 
              })
          );
        }
      })
      }
    
    });

    await Promise.all(MachineUpdatePromise );

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
      const totalEstimatedAmount = jobItems.reduce((sum, item) => {
        const itemPrice = item.estimatedPrice || 0;

        const consumablePrice = Array.isArray(item.consumable)
          ? item.consumable.reduce((s, c) => s + (c.price || 0), 0)
          : 0;

        const machineCost = Array.isArray(item.machine)
          ? item.machine.reduce((s, m) => s + (m.machineEstimatedCost || 0), 0)
          : 0;

        return sum + itemPrice + consumablePrice + machineCost;
      }, 0);

      updateData.jobItems = jobItems.map(item => ({
        itemData: new Map(Object.entries(item.itemData || {})),
        category: item.category,
        estimatedManHours: item.estimatedManHours,
        numberOfWorkers: item.numberOfWorkers,
        estimatedPrice: item.estimatedPrice || 0,

        machine: Array.isArray(item.machine)
          ? item.machine.map(m => ({
              machineRequired: m.machineRequired || null,
              startTime: m.startTime || null,
              endTime: m.endTime || null,
              actualDuration: m.actualDuration || null,
            }))
          : [],

        workers: Array.isArray(item.workers) ? item.workers : [],
        consumable: Array.isArray(item.consumable) ? item.consumable : [],
      }));

      updateData.totalEstimatedAmount = totalEstimatedAmount;

      // ✅ RELEASE OLD MACHINES
      const oldMachineIds = [];
      existingJob.jobItems.forEach(item => {
        if (Array.isArray(item.machine)) {
          item.machine.forEach(m => {
            if (m.machineRequired) {
              oldMachineIds.push(m.machineRequired);
            }
          });
        }
      });

      if (oldMachineIds.length > 0) {
        await MachineModel.updateMany(
          { _id: { $in: oldMachineIds } },
          { isAvailable: true, jobId: null }
        );
      }

      // ✅ ASSIGN NEW MACHINES
      const machineUpdatePromises = [];
      jobItems.forEach((item, itemIndex) => {
        if (Array.isArray(item.machine)) {
          item.machine.forEach((machine, machineIndex) => {
            if (machine.machineRequired) {
              machineUpdatePromises.push(
                MachineModel.findByIdAndUpdate(
                  machine.machineRequired,
                  { isAvailable: false, jobId },
                  { new: true }
                ).catch(error => {
                  console.error(
                    `Error updating machine ${machine.machineRequired} for item ${itemIndex}, machine ${machineIndex}:`,
                    error
                  );
                  return null;
                })
              );
            }
          });
        }
      });

      await Promise.all(machineUpdatePromises);
    }

    if (status) {
      updateData.status = status;
    }

    updateData.updatedAt = Date.now();

    const updatedJob = await JobCardModel.findByIdAndUpdate(jobId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("templateId")
      .populate("createdBy")
      .populate("jobItems.machine.machineRequired")
      .populate("jobItems.workers.workerAssigned");

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



export const endWorkerTimer = async (req, res) => {
  try {
    const { jobId, jobItemId, workerObjectId } = req.params;
    
    if (!jobId || !jobItemId || !workerObjectId) {
      console.error("Please provide valid jobId, jobItemId and workerObjectId");
      return res.status(400).json({
        success: false,
        message: "Please provide valid jobId, jobItemId and workerObjectId",
      });
    }

    const job = await JobCardModel.findById(jobId);
    if (!job) {
      console.error("Job not found");
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const jobItem = job.jobItems.find(i => i._id.toString() === jobItemId);
    if (!jobItem) {
      return res.status(404).json({
        success: false,
        message: "Job item not found",
      });
    }

    let workerFound = false;
    
    for (const worker of jobItem.workers) {
      if (worker?.workerAssigned?.toString() === workerObjectId) {

        if (!worker.startTime) {
          return res.status(400).json({
            success: false,
            message: "Worker timer was never started",
          });
        }

        if (worker.endTime) {
          return res.status(400).json({
            success: false,
            message: "Worker timer already ended",
          });
        }

        worker.endTime = new Date();
        
        // Calculate duration for this work session in minutes
        const startTime = new Date(worker.startTime);
        const endTime = new Date(worker.endTime);
        const sessionDurationInMinutes = Math.floor((endTime - startTime) / (1000 * 60));
        
    
        worker.actualDuration = (worker.actualDuration || 0) + sessionDurationInMinutes;
        
        console.log(`Worker timer ended. Session Duration: ${sessionDurationInMinutes} minutes, Total Accumulated: ${worker.actualDuration} minutes`);
        workerFound = true;
        break;
      }
    }

    if (!workerFound) {
      console.error("Worker not found in job items");
      return res.status(404).json({
        success: false,
        message: "Worker not found in job items",
      });
    }

    
    let allWorkersCompleted = true;
    
    if (jobItem.workers.length === 0) {
      allWorkersCompleted = false;
    } else {
      for (const w of jobItem.workers) {
      
        if (!w.endTime) {
          allWorkersCompleted = false;
          break;
        }
      }
    }


    if (allWorkersCompleted && jobItem.workers.length > 0) {
      jobItem.status = 'completed';
      console.log(`Job item ${jobItemId} marked as completed`);
      let actualManHours=jobItem.workers.reduce((sum,w)=>sum+(w.actualDuration ||0),0)

      job.actualManHours += actualManHours;

      
      // Release all machines assigned to this completed job item
      if (Array.isArray(jobItem.machine) && jobItem.machine.length > 0) {
        const machineReleasePromises = jobItem.machine
          .filter(m => m.machineRequired && mongoose.isValidObjectId(m.machineRequired))
          .map(async (machine) => {
            try {
              return await MachineModel.findByIdAndUpdate(
                machine.machineRequired,
                { 
                  isAvailable: true,
                  jobId: null
                },
                { new: true }
              );
            } catch (error) {
              console.error(`Error releasing machine ${machine.machineRequired}:`, error);
              return null;
            }
          });
        
        await Promise.all(machineReleasePromises);
        console.log(`Released ${machineReleasePromises.length} machine(s) for job item ${jobItemId}`);
      }
    }

    // Check if ALL job items are completed
    let allJobItemsCompleted = true;
    for (const item of job.jobItems) {
      if (item.status !== 'completed') {
        allJobItemsCompleted = false;
        break;
      }
    }

    // Only mark the entire job as completed if ALL job items are completed
    if (allJobItemsCompleted) {
      job.status = 'completed';
      console.log(`Job ${jobId} marked as completed`);
    }


    await job.save();

    res.status(200).json({
      success: true,
      message: "Worker timer ended successfully",
      data: {
        jobId: job._id,
        jobItemId: jobItem._id,
        workerObjectId,
        duration: jobItem.workers.find(w => w.workerAssigned.toString() === workerObjectId)?.actualDuration,
        jobItemStatus: jobItem.status,
        jobStatus: job.status
      }
    });

  } catch (error) {
    console.error("Error ending worker timer:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


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


export const supervisorApproval = async (req, res) => { {
  try {
    const { jobId } = req.params;
    const job = await JobCardModel.findById(jobId);
    if (!job) {
      return res.status(404).send({ 
        success: false, 
        message: "Job not found" 
      });
    }
    job.status = 'supapproved';
    await job.save();
    res.status(200).json({
      success: true,
      message: "Supervisor approval recorded successfully",
      job
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Unable to record supervisor approval",
      error,
    });
  }

}};


export const supervisorRejection = async (req, res) => { {
  try {
    const { jobId } = req.params;
    const { notes } = req.body;
    const job = await JobCardModel.findById(jobId);
    if (!job) {
      return res.status(404).send({ 
        success: false, 
        message: "Job not found" 
      });
    }
    job.status = 'rejected';
    job.notes = notes;
    await job.save();
    res.status(200).json({
      success: true,
      message: "Supervisor rejection recorded successfully",
      job
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Unable to record supervisor rejection",
      error,
    });
  }
}};



export const qualityGoodController = async(req,res)=>{
  try {
    const {jobId,userId,jobItemId }= req.params;
    const job = await JobCardModel.findById(jobId);
    const jobItem = job.jobItems.id(jobItemId);
    // Check if job item exists
    if (!jobItem) {
      return res.status(404).send({
        success: false,
        message: "Job item not found"
      });
    }
    job.status = 'approved';
    jobItem.status = 'approved';
    jobItem.qualityStatus = 'good'; 
    job.workVerified = userId;

    await job.save();
    console.log(job)
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
    const {jobId,jobItemId,userId}= req.params;
    const { notes } = req.body;
    const job=await JobCardModel.findById(jobId)
    const jobItem = job.jobItems.id(jobItemId);
    
    // Check if job item exists
    if (!jobItem) {
      return res.status(404).send({
        success: false,
        message: "Job item not found"
      });
    }
    
    job.status = 'rejected';
    jobItem.status = 'rejected';
    jobItem.qualityStatus = 'needs_work'; 
    jobItem.notes = notes;
    job.workVerified = userId;
    await job.save();
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


export const updateActualCostController = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { actualTotalAmount } = req.body;
    const job = await JobCardModel.findByIdAndUpdate(
      jobId,
      { actualTotalAmount },
      { new: true }
    );
    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Actual cost updated successfully",
      job
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: error.errorResponse.errmsg || "Unable to update actual cost",
      error,
    });
  }
};