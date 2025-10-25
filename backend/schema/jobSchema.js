import mongoose from "mongoose";


const jobSchema = new mongoose.Schema({
  jobNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  vehicleDetails: {
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'truck', 'bus', 'other'],
      required: true
    },
    make: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    year: Number,
    registrationNumber: {
      type: String,
      required: true
    },
    currentMileage: Number,
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid', ]
    }
  },
  
  jobType: {
    type: String,
    enum: ['repair', 'maintenance', 'inspection', 'customization', 'emergency'],
    required: true
  },
  
  serviceCategory: {
    type: String,
    enum: ['engine_repair', 'body_work', 'painting', 'electrical', 'ac_service', 
           'oil_change', 'brake_service', 'suspension', 'transmission', 'general_maintenance'],
    required: true
  },
  
  problemDescription: {
    type: String,
    required: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'on_hold', 'qa_review', 'completed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  assignedWorkers: [{
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['primary', 'assistant']
    }
  }],
  
  estimatedCost: {
    laborCost: {
      type: Number,
      default: 0
    },
    partsCost: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    }
  },
  
  actualCost: {
    laborCost: {
      type: Number,
      default: 0
    },
    partsCost: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    }
  },
  
  partsUsed: [{
    partName: String,
    partNumber: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    supplier: String
  }],
  
  timeline: {
    estimatedStartDate: Date,
    actualStartDate: Date,
    estimatedCompletionDate: Date,
    actualCompletionDate: Date,
    deliveryDate: Date
  },
  
  workLog: [{
    date: {
      type: Date,
      default: Date.now
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: String,
    hoursWorked: Number,
    status: String
  }],
  
  // QA/QC Section
  qaStatus: {
    type: String,
    enum: ['pending', 'passed', 'failed', 'not_required'],
    default: 'pending'
  },
  
  qaReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    checklistItems: [{
      item: String,
      status: {
        type: String,
        enum: ['pass', 'fail', 'na']
      },
      notes: String
    }],
    overallNotes: String,
    imagesAfterQA: [String]
  },
  
  images: {
    beforeRepair: [String],
    duringRepair: [String],
    afterRepair: [String]
  },
  
  customerApproval: {
    estimateApproved: {
      type: Boolean,
      default: false
    },
    approvalDate: Date,
    additionalWorkApproved: {
      type: Boolean,
      default: false
    }
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  
  paymentDetails: {
    advanceAmount: {
      type: Number,
      default: 0
    },
    balanceAmount: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer']
    },
    transactionIds: [String]
  },
  
  customerFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    feedbackDate: Date
  },
  
  notes: {
    type: String
  },
  
  warrantyInfo: {
    hasWarranty: {
      type: Boolean,
      default: false
    },
    warrantyPeriod: Number, // in days
    warrantyExpiryDate: Date,
    warrantyTerms: String
  }
}, {
  timestamps: true
});

// Generate job number automatically
jobSchema.pre('save', async function(next) {
  if (!this.jobNumber) {
    const count = await mongoose.model('Job').countDocuments();
    this.jobNumber = `JOB${Date.now()}${count + 1}`;
  }
  next();
});




const JobSchema= await mongoose.model("job",jobSchema);

export default JobSchema;