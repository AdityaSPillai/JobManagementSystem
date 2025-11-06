import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase:true
        
    },
    type: {
        type: String,
        required: true,
        trim: true,
    },
    hourlyRate: {
        type: Number,
        required: false
    },
    status: {
        type: Boolean,
        default: true 
    },
    purchaseDate: {
        type: Date,
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    lastMaintenanceDate: {
        type: Date
    },
    nextMaintenanceDate: {
        type: Date
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
  
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      required: function () {
        return this.isAvailable === false;
              }
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
        type: Number,  
        default: null

        },
    
}, {
    timestamps: true
});

const MachineModel = mongoose.model("Machine", machineSchema);

export default MachineModel;