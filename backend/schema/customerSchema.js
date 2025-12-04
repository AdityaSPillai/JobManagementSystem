import mongoose from "mongoose";


const customerSchema= new mongoose.Schema({
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
    
    address:{
        type:String,
        required:true,
        trim:true
    },
    productId:{
        type: String,
        trim:true
    },
    productModel:{
        type: String,
        trim:true
    },
    productIdentification:{
        type: String,
        trim:true
    },
    shopId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    }


});

const CustomerModel= mongoose.model("Customer",customerSchema);

export default CustomerModel;