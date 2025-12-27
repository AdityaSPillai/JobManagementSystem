import JobCardModel from "../schema/jobCardSchema.js";
import RejectedJobModel from "../schema/rejectedJobSchema.js";

export const rejectedJobController = async (req, res) => {
  try {
    const { jobId, reason, rejectedBy, shopId } = req.body;

    if (!jobId || !reason || !rejectedBy || !shopId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const job = await JobCardModel.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // ✅ 1. Collect all machine IDs used in this job
    const machineIds = [];

    job.jobItems.forEach(item => {
      if (Array.isArray(item.machine)) {
        item.machine.forEach(m => {
          if (m.machineRequired) {
            machineIds.push(m.machineRequired);
          }
        });
      }
    });

    // ✅ 2. Release all machines
    if (machineIds.length > 0) {
      await MachineModel.updateMany(
        { _id: { $in: machineIds } },
        {
          $set: {
            isAvailable: true,
            jobId: null
          }
        }
      );
    }

    // ✅ 3. Move job to rejected collection
    const rejectedJob = await RejectedJobModel.create({
      originalJobId: job._id,
      rejectionReason: reason,
      rejectedBy,
      shopId,
      fullJobData: job,
      rejectedAt: new Date()
    });

    // ✅ 4. Delete original job
    await JobCardModel.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: "Job rejected, machines released, and job archived",
      rejectedJob
    });

  } catch (error) {
    console.error("Error rejecting job:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};




export const getRejectedJobsController = async (req, res) => {
  try {
    const rejectedJobs = await RejectedJobModel.find().sort({ rejectedAt: -1 });
    res.status(200).send({
      success: true,
      message: "Rejected jobs fetched successfully",
      rejectedJobs
    });
  } catch (error) {
    console.error("Error fetching rejected jobs:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};



export const getAllShopRejecetedJobsController = async (req, res) => {
  try {
    const { shopId } = req.params;
    const rejectedJobs = await RejectedJobModel.find({ shopId }).sort({ rejectedAt: -1 });
    res.status(200).send({
      success: true,
      message: "Rejected jobs fetched successfully",
      rejectedJobs
    });
  } catch (error) {
    console.error("Error fetching rejected jobs:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

export const deleteRejectedJobController = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const deletedJob = await RejectedJobModel.findByIdAndDelete(jobId);

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).send({
      success: true,
      message: "Job deleted successfully",
      deletedJob
    });

  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};