import { ProviderEnum } from "../../common/enum/user.enum.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/security/encrypt.security.js";
import { Compare, Hash } from "../../common/utils/security/hash.security.js";
import { GenerateToken, VerifyToken } from "../../common/utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken"
import {v4 as uuidv4} from "uuid"

export const signup = async (req, res, next) => {
  try {
    const { userName, email, password, age, gender, phone } = req.body;
    //to check on userName
    // if(userName.split(" ").length<2) {
    // }

    const emailExits = await db_service.findOne({
      model: userModel,
      filter: { email },
    });
    if (emailExits) {
      return res.status(409).json({ message: "email already exist" });
    }
    const user = await db_service.create({
      model: userModel,
      data: {
        userName,
        email,
        password: Hash({plainText:password,salt_rounds: 12}),
        age,
        gender,
        phone: encrypt(phone),
      },
    });
    res.status(201).json({ message: "done", user });
  } catch (error) {
    res.status(404).json({ message: error.message, stack: error.stack });
  }
};
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await db_service.findOne({
      model: userModel,
      filter: { email, provider: ProviderEnum.system },
    });
    if (!user) {
      return res.status(409).json({ message: "user not exist" });
    }
    const match = Compare({plainText:password, cipherText:user.password});
    if (!match) {
      return res.status(400).json({ message: "invalid password" });
    }
    const access_token = GenerateToken(
    {
        payload:{id:user._id,email:user.email},
        secret_key:"shahd",
       options: {
    expiresIn: 60*10,
    // notBefore:60*60,
    // jwtid:uuidv4()

}})
    res.status(201).json({ message: "success login", data:{access_token} });
  } catch (error) {
    res.status(404).json({ message: error.message, stack: error.stack });
  }
};
export const getProfile = async (req, res, next) => {
  try {
  


    res
      .status(201)
      .json({
        message: "done",
        data:req.user,
      });
  } catch (error) {
    res.status(404).json({ message: error.message, stack: error.stack });
  }
};
