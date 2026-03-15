import { VerifyToken } from "../utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { ACCESS_SECRET_KEY, PREFIX } from "../../../config/config.service.js";
import revokeToken from "../../DB/models/revokeToken.model.js";
import { get, revoked_key } from "../../DB/redis/redis.service.js";

export const authenticaion = async(req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);
  
  if (!authorization) {
    throw new Error("Token not exist");
  }
  const [prefix, token] = authorization.split(" ");
  if(prefix !== PREFIX) {
    throw new Error("invalid Token prefix");
  }
  const decoded = VerifyToken({ token, secret_key:ACCESS_SECRET_KEY });
  if (!decoded || !decoded?.id) {
    throw new Error("invalid Token payload");
  }
      const user = await db_service.findOne({
      model: userModel,
      id:decoded.id,
      // select: "-password",
    });
    if (!user) {
      return res.status(409).json({ message: "user not exist" });
    }

    if(user?.changeCredentials?.getTime() > decoded.iat * 1000) {
      throw new Error("Token expired, please login again");
    }
    const isRevoked = await get(revoked_key({userId:decoded.id,iti:decoded.jti}));
    if(isRevoked) {
      throw new Error("Token revoked, please login again");
    }
req.user = user
req.decoded = decoded
next()
};
