import mongoose from "mongoose"
const checkConnectionDB = async()=>{
    await mongoose.connect("mongodb://127.0.0.1:27017/sarahaApp",{serverSelectionTimeoutMS:5000})
    .then(()=>{
        console.log("connect to DB Successfully")
    }).catch((error)=>{
        console.log("failed to connect DB",error);
        
    })

}

export default checkConnectionDB