import mongoose from "mongoose";


const connectDB=async()=>{
    try {
        const result= await mongoose.connect(process.env.MONGOOSE_CONNECTION_URL);

        if(!result){
            console.error("Error while connecting to Database");
        }

        console.log("Database connected succsfully✅");
    } catch (error) {
        console.log("An error occured"+error);
    }
}


export default connectDB;