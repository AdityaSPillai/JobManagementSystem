import mongoose from "mongoose";

const JobCardSchema = new mongoose.Schema({
  jobCardNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Reference to the template used
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormTemplate',
    required: true
  },
  
  // Dynamic form data stored as key-value pairs
  formData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Job items with dynamic fields
  
  jobItems: [{ 
    _id: {  // MongoDB creates this automatically, but let's be explicit
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      required: true
    }, 
    itemData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    estimatedPrice: {
      type: Number,
      default: 0
    },
    machine: {
      machineRequired: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Machine",
        required: false,
      },
      startTime: {
        type: Date,
        default: null
      },
      endTime: {
        type: Date,
        default: null
      },
      actualDuration: {
        type: Number,  // Duration in minutes
        default: null
      }
    },
    worker: {
      workerAssigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      startTime: {
        type: Date,
        default: null
      },
      endTime: {
        type: Date,
        default: null
      },
      actualDuration: {
        type: Number,  // Duration in minutes
        default: null
      }
    },
    material: {
      materialsRequired: {
        type: [String], 
        default: []
      },
      estimatedPrice: {
        type: Number,
        default: 0
      }
    }
  }],
  
  totalEstimatedAmount: {
    type: Number,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  isVerifiedByUser:{
    type:Boolean,
    default:false
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

JobCardSchema.set('timestamps', true);

const JobCardModel = mongoose.model("JobCard", JobCardSchema);
export default JobCardModel;