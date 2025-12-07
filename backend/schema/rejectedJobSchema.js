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
  shopId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Shop'
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
