import mongoose from "mongoose";
const revokeTokenSchema = new mongoose.Schema(
  {
tokenId: {
  type: String,
  required: true,
  unique: true,
  trim: true,
},
userId:{
  type: mongoose.Types.ObjectId,
  ref: "user",
  required: true,
},
expireAt: {
  type: Date,
  required: true,
 
},

  },
  {
    timestamps: true,
    strictQuery: true,
  
  },
);

revokeTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
const revokeToken = mongoose.models.revokeToken || mongoose.model("revokeToken", revokeTokenSchema);
revokeToken.syncIndexes();
export default revokeToken;
