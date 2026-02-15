import { VerifyToken } from "../utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";

export const authenticaion = async(req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("Token not exist");
  }
  const decoded = VerifyToken({ token: authorization, secret_key: "shahd" });
  if (!decoded || !decoded?.id) {
    throw new Error("invalid Token");
  }
      const user = await db_service.findOne({
      model: userModel,
      id:decoded.id,
      select: "-password",
    });
    if (!user) {
      return res.status(409).json({ message: "user not exist" });
    }
req.user = user
next()
};
