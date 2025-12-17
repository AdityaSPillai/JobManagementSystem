import mongoose from "mongoose";
import { act } from "react";

const JobCardSchema = new mongoose.Schema({
  jobCardNumber: {
    type: String,
    required: true,
    //unique: true //Needed when adding Job invoice Creation, do check the rest of the programs logic when adding this, as this causes problems in Job Creation and deletion.
  },
  
  // Reference to the template used
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormTemplate',
    required: true
  },
  
  customerIDNumber: {
    type: String,
    required: true,
  },
  
  // Dynamic form data stored as key-value pairs
  formData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  shopId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Shop",
    required:true
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
    category:{
      type:String,
      required:true
    },
    estimatedManHours:{
      type:Number,
      required:true
    },
    numberOfWorkers:{
      type:Number,
      required:true,
      default:1,
    },
     workers: [{
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
    }],
    machine: [{
      machineRequired: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Machine",
        required: false,
        default: null
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
    }],
   
    consumable: [{
      name: {
        type: String,
        required: false,
      },
      price: {
        type: Number,
        default: 0,
      },
      available: {
        type: Boolean,
        default: true,
      }
    }],
     status: {
    type: String,
    enum: ['waiting','pending', 'in_progress', 'completed','approved', 'rejected'],
    default: 'pending'
  },
   notes:{
    type:String,
    default:null,
  },
  }],
  
  totalEstimatedAmount: {
    type: Number,
    default: 0
  },
   actualManHours:{
    type:Number,
    default:0
  },
  actualTotalAmount:{
    type:Number,
    default:0
  },
  actualManHours:{
    type:Number,
    default:0
  },
  
  status: {
    type: String,
    enum: ['waiting','pending', 'in_progress', 'completed','supapproved','approved', 'rejected'],
    default: 'pending'
  },
  isVerifiedByUser:{
    type:Boolean,
    default:false
  },
  workVerified:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default:null
  },
  qualityStatus:{
    type:String,
    enum:['good','need-work'],
    default:'need-work',
  },
  notes:{
    type:String,
    default:null,
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