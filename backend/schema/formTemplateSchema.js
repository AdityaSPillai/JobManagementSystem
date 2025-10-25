import mongoose from "mongoose";
import { type } from "os";

const FormTemplateSchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: true,
    unique: true,
    default: "Default Job Card"
  },
  businessType: {
    type: String,
    enum: ['workshop', 'plumbing', 'electrical', 'general', 'custom'],
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Main form fields configuration
  formFields: [{
    fieldId: {
      type: String,
      required: true  // e.g., "customer_name", "vehicle_number"
    },
    fieldLabel: {
      type: String,
      required: true  // e.g., "Vehicle Owner Name"
    },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'email', 'phone', 'date', 'dropdown', 'textarea'],
      default: 'text'
    },
    placeholder: String,
    isRequired: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    validation: {
      minLength: Number,
      maxLength: Number,
      pattern: String,
      min: Number,
      max: Number
    },
    dropdownOptions: [String],  // For dropdown type fields
    width: {
      type: String,
      enum: ['full', 'half', 'third'],
      default: 'half'
    }
  }],
  
  // Job items configuration
  jobItemsConfig: {
    enabled: {
      type: Boolean,
      default: true
    },
    sectionLabel: {
      type: String,
      default: "Job Items"
    },
    fields: [{
      fieldId: String,        // e.g., "job_type", "description"
      fieldLabel: String,     // e.g., "Job Type", "Description"
      fieldType: String,
      placeholder: String,
      isRequired: Boolean,
      order: Number,
      dropdownOptions: [String]
    }],
    allowMultiple: {
      type: Boolean,
      default: true
    },
    showPricing: {
      type: Boolean,
      default: true
    }
  },
  isVerifiedByUser:{
    type:Boolean,
    default:false
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



const FormTemplateModel= new mongoose.model("FormTemplate",FormTemplateSchema);

export default FormTemplateModel;
