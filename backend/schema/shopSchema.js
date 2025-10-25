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
  
  operatingHours: {
    monday: { open: String, close: String, isClosed: Boolean },
    tuesday: { open: String, close: String, isClosed: Boolean },
    wednesday: { open: String, close: String, isClosed: Boolean },
    thursday: { open: String, close: String, isClosed: Boolean },
    friday: { open: String, close: String, isClosed: Boolean },
    saturday: { open: String, close: String, isClosed: Boolean },
    sunday: { open: String, close: String, isClosed: Boolean }
  },
  
  services: [{
    type: String,
    enum: ['engine_repair', 'body_work', 'painting', 'electrical', 'ac_service', 
           'oil_change', 'brake_service', 'suspension', 'transmission', 'general_maintenance']
  }],
  
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
  }
}, {
  timestamps: true
});



const ShopModel= await mongoose.model("Shop",shopSchema)
export default ShopModel;