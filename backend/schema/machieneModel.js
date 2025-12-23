import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true

    },
    machineId: {
        type: String,
        unique: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        trim: true,
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
    supplier: {
        type: String,
        default:null ,
        required: true
    },
    hsCode:{
        type: String,
        default: null
        
    },
    brand:{
        type: String,
        default: null,
        required: true
    },
    countryOfOrigin:{
        type: String,
        default: null,
        required: true
    },
    modelNumber:{
        type: String,
        default: null,
        required: true
    },
    modelYear:{
        type: Date,
        default: null,
        required: true
    },
    assetType:{
        type: String,
        default: null,
        required: true
    },
    assetValue:{
        type: Number,
        default: null,
        required: true
    },
    landedCost:{
        type: Number,
        default: null
    },
    intsallationCost:{
        type: Number,
        default: null
    },
    capitalizedValue:{
        type: Number,
        default: null
    },
    limeTime:{
        type: Number,
        default: null
    },
    depreciationPeriod:{
        type: Number,
        default: null
    },

}, {
    timestamps: true
});

const MachineModel = mongoose.model("Machine", machineSchema);

export default MachineModel;