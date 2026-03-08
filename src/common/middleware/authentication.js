import { VerifyToken } from "../utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { ACCESS_SECRET_KEY, PREFIX } from "../../../config/config.service.js";

export const authenticaion = async(req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("Token not exist");
  }
  const [prefix, token] = authorization.split(" ");
  if(prefix !== PREFIX) {
    throw new Error("invalid Token prefix");
  }
  const decoded = VerifyToken({ token, secret_key:ACCESS_SECRET_KEY });
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
