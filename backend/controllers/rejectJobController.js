import JobCardModel from "../schema/jobCardSchema.js";
import RejectedJobModel from "../schema/rejectedJobSchema.js";

export const rejectedJobController = async (req, res) => {
  try {
    const { jobId, reason, rejectedBy } = req.body;

    if (!jobId || !reason || !rejectedBy) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const job = await JobCardModel.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const rejectedJob = await RejectedJobModel.create({
      originalJobId: job._id,
      rejectionReason: reason,
      rejectedBy,
      fullJobData: job,
      rejectedAt: new Date()
    });

    await JobCardModel.findByIdAndDelete(jobId);

    res.status(200).send({
      success: true,
      message: "Job rejected and moved successfully",
      rejectedJob
    });

  } catch (error) {
    console.error("Error rejecting job:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};



export const getRejectedJobsController= async (req, res) => {
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
