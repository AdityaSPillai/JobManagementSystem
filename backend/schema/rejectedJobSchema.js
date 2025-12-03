import mongoose from "mongoose";

const RejectedJobSchema = new mongoose.Schema({
  originalJobId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rejectionReason: {
    type: String,
    required: true
  },
  rejectedBy: {
    type: String,
    required: true
  },
  fullJobData: {
    type: Object,
    required: true
  },
  rejectedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("RejectedJob", RejectedJobSchema);
