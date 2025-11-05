import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin','owner', 'worker', 'customer', 'qa_qc', 'desk_employee','supervisor'],
    required: true
  },

  
  password: {
    type: String,
    required: function() {
      return this.role === 'owner' || this.role === 'qa_qc' || this.role==="supervisor" || this.role==="desk_employee";
    }
  },
  
  // For Owner/Worker specific fields
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: function() {
      return  this.role === 'worker' || this.role === 'qa_qc'|| this.role==='desk_employee' || this.role==="supervisor";
    }
  },
  
  // For Worker specific fields
  specialization: {
    type: String,
    enum: ['mechanic', 'electrician', 'bodywork', 'painter', 'general'],
    required: function() {
      return this.role === 'worker' || this.role === 'qa_qc'||this.role==="supervisor";
    }
  },
  hourlyRate: {
    type: Number,
    required: function() {
      return this.role === 'worker' || this.role === 'qa_qc'|| this.role==='desk_employee'|| this.role==="supervisor";
    }
  },
  experience: {
    type: Number, // years of experience
    required: function() {
      return this.role === 'worker' || this.role === 'qa_qc' || this.role==="supervisor";
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // For Customer specific fields
  vehicleDetails: [{
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'truck', 'bus', 'other']
    },
    make: String,
    model: String,
    year: Number,
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    vin: String // Vehicle Identification Number
  }],
  
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  
  profileImage: {
    type: String,
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});


const UserModel=mongoose.model("User",userSchema);

export default UserModel;