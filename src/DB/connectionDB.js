import mongoose from "mongoose";
import { DB_URL } from "../../config/config.service.js";
const checkConnectionDB = async () => {
  await mongoose
    .connect(DB_URL, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log(`connect to DB ${DB_URL} Successfully`);
    })
    .catch((error) => {
      console.log("failed to connect DB", error);
    });
};

export default checkConnectionDB;
