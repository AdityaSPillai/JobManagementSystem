import mongoose from "mongoose";
import FormTemplateModel from "../schema/formTemplateSchema.js";
import ShopModel from "../schema/shopSchema.js";
import JobCardModel from "../schema/jobCardSchema.js";
import MachineModel from "../schema/machieneModel.js";

function timeDifference(end, start) {
  return Math.round((end - start) / (1000));
};


export const createJobCard = async (req, res) => {
  try {
    const { templateId, workVerified, shopId, customerIDNumber, formData, jobItems } = req.body;

    // Validate template exists
    const template = await FormTemplateModel.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found"
      });
    }

    //Needs to be checked
    const totalEstimatedAmount = jobItems.reduce(
      (sum, item) => sum + (Number(item.estimatedPrice) || 0),
      0
    );

    for (const jobItem of jobItems) {
      if (!Array.isArray(jobItem.machine)) continue;

      for (const m of jobItem.machine) {
        const machine = await MachineModel.findById(m.machineRequired);
        if (!machine) {
          throw new Error("Invalid machine selected");
        }

        const shop = await ShopModel.findById(shopId);
        const category = shop.machineCategory.find(
          c => c.name === machine.type
        );

        if (!category) {
          throw new Error(`Machine category ${machine.type} not found`);
        }

        m.machineRate = category.hourlyRate;
      }
    }

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
      customerIDNumber,
      shopId,
      isVerifiedByUser: false,
      workVerified,
      formData: new Map(Object.entries(formData)),
      jobItems: jobItems.map(item => ({
        itemData: new Map(Object.entries(item.itemData || {})),

        estimatedPrice: item.estimatedPrice || 0,

        allowedWorkers: Array.isArray(item.allowedWorkers)
          ? item.allowedWorkers.map(w => ({
            category: w.category,
            estimatedManHours: w.estimatedManHours,
            numberOfWorkers: w.numberOfWorkers,
            hourlyRate: w.hourlyRate
          }))
          : [],

        machine: Array.isArray(item.machine)
          ? item.machine.map(m => ({
            machineRequired: m.machineRequired || null,
            machineRate: m.machineRate || 0,
            estimatedMachineHours: m.estimatedMachineHours || 0,
            startTime: null,
            endTime: null,
            actualDuration: 0
          }))
          : [],

        workers: Array.isArray(item.workers) ? item.workers : [],
        consumable: Array.isArray(item.consumable) ? item.consumable : [],
      })),
      status: 'waiting',
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


    res.status(201).json({
      success: true,
      message: "Job card created successfully",
      data: jobCard
    });
  } catch (error) {
    console.error("Error creating job card:", error);
    res.status(500).json({
      success: false,
      message: "Error occuerd " + error.message
    });
  }
};


export const getAllJobs = async (req, res) => {
  try {
    const jobs = await JobCardModel.find();

    if (jobs.length == 0) {
      console.log("No jobs added");
      return res.status(400).send({
        success: false,
        message: "No jobs available"
      })
    }

    res.status(200).send({
      success: true,
      message: "All jobs available",
      jobs
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const getAllJobsByCustomerID = async (req, res) => {
  try {
    const { customerIDNumber } = req.params;

    const jobs = await JobCardModel.find({
      customerIDNumber,
    });

    if (!jobs.length) {
      return res.status(404).json({
        success: false,
        message: "No jobs found for this customer"
      });
    }

    res.status(200).send({
      success: true,
      message: "All jobs done by customer found",
      jobs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


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
      const totalEstimatedAmount = jobItems.reduce(
        (sum, item) => sum + (Number(item.estimatedPrice) || 0),
        0
      );

      updateData.jobItems = jobItems.map(item => ({
        itemData: new Map(Object.entries(item.itemData || {})),

        estimatedPrice: item.estimatedPrice || 0,

        allowedWorkers: Array.isArray(item.allowedWorkers)
          ? item.allowedWorkers.map(w => ({
            category: w.category,
            estimatedManHours: w.estimatedManHours,
            numberOfWorkers: w.numberOfWorkers,
            hourlyRate: w.hourlyRate
          }))
          : [],

        machine: Array.isArray(item.machine)
          ? item.machine.map(m => ({
            machineRequired: m.machineRequired || null,
            startTime: m.startTime || null,
            endTime: m.endTime || null,
            actualDuration: m.actualDuration || 0,
          }))
          : [],

        workers: Array.isArray(item.workers) ? item.workers : [],
        consumable: Array.isArray(item.consumable) ? item.consumable : [],
      }));

      updateData.totalEstimatedAmount = totalEstimatedAmount;





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

export const deleteJobController = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await JobCardModel.findByIdAndDelete(jobId);

    if (!job) {
      console.log("Job was not deleted ");
    }

    res.status(200).send({
      success: true,
      message: "Job deleted Succesfully",
      job

    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


export const startMachineForJobItem = async (req, res) => {
  try {
    const { jobId, jobItemId, machineId } = req.params;

    const job = await JobCardModel.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const jobItem = job.jobItems.id(jobItemId);
    if (!jobItem) return res.status(404).json({ success: false, message: "Job item not found" });

    const machine = jobItem.machine.find(
      m => m.machineRequired?.toString() === machineId
    );
    if (!machine) return res.status(404).json({ success: false, message: "Machine not found" });

    if (machine.startTime) {
      return res.status(400).json({ success: false, message: "Machine already running" });
    }

    machine.startTime = new Date();
    if (!machine.actualStartTime) {
      machine.actualStartTime = new Date();
    }

    await MachineModel.findByIdAndUpdate(machineId, {
      isAvailable: false,
      jobId
    });

    await job.save();

    res.status(200).json({
      success: true,
      message: "Machine timer started",
      machine
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pauseMachineForJobItem = async (req, res) => {
  try {
    const { jobId, jobItemId, machineId } = req.params;

    const job = await JobCardModel.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const jobItem = job.jobItems.id(jobItemId);
    if (!jobItem) return res.status(404).json({ success: false, message: "Job item not found" });

    const machine = jobItem.machine.find(
      m => m.machineRequired?.toString() === machineId
    );
    if (!machine) return res.status(404).json({ success: false, message: "Machine not found" });

    if (!machine.startTime) {
      return res.status(400).json({ success: false, message: "Machine timer not running" });
    }

    const pauseTime = new Date();
    const duration = timeDifference(pauseTime, machine.startTime);

    machine.actualDuration = (machine.actualDuration || 0) + duration;
    machine.startTime = null;

    await job.save();

    res.status(200).json({
      success: true,
      message: "Machine timer paused",
      machine
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const endMachineForJobItem = async (req, res) => {
  try {
    const { jobId, jobItemId, machineId } = req.params;

    const job = await JobCardModel.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const jobItem = job.jobItems.id(jobItemId);
    if (!jobItem) return res.status(404).json({ success: false, message: "Job item not found" });

    const machine = jobItem.machine.find(
      m => m.machineRequired?.toString() === machineId
    );
    if (!machine) return res.status(404).json({ success: false, message: "Machine not found" });

    if (!machine.startTime) {
      return res.status(400).json({ success: false, message: "Machine timer not started" });
    }

    const endTime = new Date();
    const duration = timeDifference(endTime, machine.startTime);

    machine.actualDuration = (machine.actualDuration || 0) + duration;
    machine.endTime = endTime;

    await MachineModel.findByIdAndUpdate(machineId, {
      isAvailable: true,
      jobId: null
    });

    await job.save();

    res.status(200).json({
      success: true,
      message: "Machine timer ended",
      machine
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    if (!worker.actualStartTime) {
      worker.actualStartTime = new Date();
    }
    jobItem.status = "in_progress";
    job.status = "in_progress";

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

export const pauseWorkerTImer = async (req, res) => {
  try {
    const { jobId, jobItemId, workerObjectId } = req.params;
    if (!jobId || !jobItemId || !workerObjectId) {
      console.error("Please provide valid jobId and userId and workerObjectId");
      return res.status(400).json({
        success: false,
        message: "Please provide valid jobId and userId",
      })
    }
    const job = await JobCardModel.findById(jobId);
    if (!job) {
      console.error("Job item not found");
      return res.status(404).json({
        success: false,
        message: "Job item not found",
      })
    }

    const jobItem = job.jobItems.find(i => i._id.toString() === jobItemId);
    if (!jobItem) {
      return res.status(404).json({
        success: false,
        message: "Job item not found",
      });
    }
    console.log("Job Item found:", jobItem.workers);
    let workerFound = false;
    for (const worker of jobItem.workers) {
      if (worker?.workerAssigned?.toString() === workerObjectId) {

        if (!worker.startTime) {
          return res.status(400).json({
            success: false,
            message: "Worker timer is not running",
          });
        }

        const pauseTime = new Date();

        const sessionDuration = timeDifference(pauseTime, worker.startTime);

        worker.actualDuration =
          (worker.actualDuration || 0) + sessionDuration;

        worker.startTime = null;
        worker.endTime = null;

        workerFound = true;
        jobItem.status = 'in_progress';
        break;
      }
    }

    await job.save()
    if (!workerFound) {
      console.error("Worker not found in job items");
      return res.status(404).json({
        success: false,
        message: "Worker not found in job items",
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
      return res.status(400).json({
        success: false,
        message: "Please provide valid jobId, jobItemId and workerObjectId",
      });
    }

    const job = await JobCardModel.findById(jobId);
    if (!job) {
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

    const worker = jobItem.workers.find(
      w => w.workerAssigned?.toString() === workerObjectId
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found in job item",
      });
    }

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

    const endTime = new Date();
    const startTime = new Date(worker.startTime);

    worker.endTime = endTime;

    const sessionDurationSeconds = Math.floor(
      (endTime - startTime) / 1000
    );

    worker.actualDuration =
      (worker.actualDuration || 0) + sessionDurationSeconds;

    await job.save();

    res.status(200).json({
      success: true,
      message: "Worker timer ended successfully",
      data: {
        jobId: job._id,
        jobItemId: jobItem._id,
        workerObjectId,
        actualDuration: worker.actualDuration,
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

export const completeJobItemController = async (req, res) => {
  try {
    const { jobId, jobItemId } = req.params;

    if (!jobId || !jobItemId) {
      return res.status(400).json({
        success: false,
        message: "JobID and JobItemId are required"
      });
    }

    const job = await JobCardModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const jobItem = job.jobItems.id(jobItemId);
    if (!jobItem) {
      return res.status(404).json({
        success: false,
        message: "Job item not found"
      });
    }

    if (
      !Array.isArray(jobItem.workers) ||
      jobItem.workers.length === 0 ||
      jobItem.workers.some(w => !w.endTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "All assigned workers must complete their work before completing the task"
      });
    }

    jobItem.status = 'completed';

    const totalActualSeconds = jobItem.workers.reduce(
      (sum, w) => sum + (w.actualDuration || 0),
      0
    );
    job.actualManHours += totalActualSeconds;

    if (Array.isArray(jobItem.machine)) {
      await Promise.all(
        jobItem.machine
          .filter(m => m.machineRequired && mongoose.isValidObjectId(m.machineRequired))
          .map(m =>
            MachineModel.findByIdAndUpdate(
              m.machineRequired,
              { isAvailable: true, jobId: null }
            )
          )
      );
    }

    const allItemsCompleted = job.jobItems.every(
      item => item.status === 'completed'
    );

    if (allItemsCompleted) {
      job.status = 'completed';
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job item completed successfully",
      data: {
        jobItemId,
        jobItemStatus: jobItem.status,
        jobStatus: job.status
      }
    });

  } catch (error) {
    console.error("Error completing job item:", error);
    res.status(500).json({
      success: false,
      message: error.message
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

    const workObject = {
      workerAssigned: userId,
      startTime: null,
      endTime: null,
      actualDuration: null
    }

    const job = await JobCardModel.findOneAndUpdate(
      {
        _id: jobId,
        "jobItems._id": jobItemId
      },
      {
        $addToSet: { "jobItems.$.workers": workObject }
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


export const supervisorApproval = async (req, res) => {
  {
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

  }
};

export const supervisorRejection = async (req, res) => {
  {
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
  }
};


export const qualityGoodController = async (req, res) => {
  try {
    const { jobId, userId, jobItemId } = req.params;
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

export const qualityBadController = async (req, res) => {
  try {
    const { jobId, jobItemId, userId } = req.params;
    const { notes } = req.body;
    const job = await JobCardModel.findById(jobId)
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
    if (Array.isArray(jobItem.workers)) {
      jobItem.workers.forEach(worker => {
        worker.endTime = null;
        worker.startTime = null;
      });
    }
    if (Array.isArray(jobItem.machine)) {
      jobItem.machine.forEach(machine => {
        machine.endTime = null;
        machine.startTime = null;
      });
    }
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


export const verifyJobController = async (req, res) => {

  try {
    const { jobId } = req.params;
    if (!jobId) {
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
    jobItem.isVerifiedByUser = true;
    jobItem.status = 'pending';
    await jobItem.save();
    res.status(200).send({
      success: true,
      message: "Job verified succesfylly",
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


export const usedConsumableController = async (req, res) => {
  try {
    const { jobId, jobItemId, consumableId } = req.params;
    const { usedQty } = req.body;

    if (!usedQty || usedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid used quantity"
      });
    }

    const job = await JobCardModel.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const jobItem = job.jobItems.id(jobItemId);
    if (!jobItem) {
      return res.status(404).json({ success: false, message: "Job item not found" });
    }

    const consumable = jobItem.consumable.id(consumableId);
    if (!consumable) {
      return res.status(404).json({ success: false, message: "Consumable not found" });
    }

    consumable.numberOfUsed += usedQty;

    if (consumable.numberOfUsed > 0) {
      consumable.available = true;
    }

    job.actualTotalAmount += consumable.price * usedQty;

    await job.save();

    res.status(200).json({
      success: true,
      message: "Consumable usage updated",
      consumable,
      actualTotalAmount: job.actualTotalAmount
    });

  } catch (error) {
    console.error("Consumable usage error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};