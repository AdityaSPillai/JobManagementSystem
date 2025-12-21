import mongoose from "mongoose";


const shopSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    alternatePhone: String
  },
  
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    landmark: String
  },
  
  businessDetails: {
    registrationNumber: String,
    gstNumber: String,
    licenseNumber: String,
    taxId: String
  },

  services:[{
    name:{
      type:String,
      required:true
    },
    description:String,
    note:String,
  }],
  
  categories:[{
     name:{
       type:String,
       required:true
     },
     hourlyRate:{
       type:Number,
       required:true,
     },
    role: {
    type: String,
    enum: ['worker', 'customer', 'qa_qc', 'desk_employee','supervisor'],
    required: true
  },
   }],

  machineCategory:[{
    name:{
      type:String,
      required:true
    },
    hourlyRate:{
      type:Number,
      required:true
    }
  }],

  consumables: [
    {
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      available: {
        type: Boolean,
        default: true
      },
      unitOfMeasure:{
        type:String,
        default:""
      },
      quantity: {
        type: Number,
        default: 0
      }
    }
  ],

  workers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalReviews: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },

  logs: {
    type: Array,
    default: []
  },
  
  logLimit: {
      type: Number,
      default: 1000
  }
}, {
  timestamps: true
});



const ShopModel= await mongoose.model("Shop",shopSchema)

export default ShopModel;
