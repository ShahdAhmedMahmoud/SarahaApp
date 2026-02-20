import { ProviderEnum } from "../../common/enum/user.enum.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/security/encrypt.security.js";
import { Compare, Hash } from "../../common/utils/security/hash.security.js";
import {
  GenerateToken,
  VerifyToken,
} from "../../common/utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { SALT_ROUNDS, SECRET_KEY } from "../../../config/config.service.js";


export const signup = async (req, res, next) => {
  try {
    const { userName, email, password, age, gender, phone } = req.body;


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
        password: Hash({
          plainText: password,
          salt_rounds:SALT_ROUNDS,
        }),
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
export const signupWithGmail = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    console.log(idToken);

    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken,
      audience:
        "1027986971476-b2pq7iu1kpu6s0tna24kqsub53b6jgi3.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    console.log(payload);
    const { email, email_verified, name, picture } = payload;
    let user = await db_service.findOne({
      model: userModel,
      filter: { email },
    });
    if (!user) {
      //register
      user = await db_service.create({
        model: userModel,
        data: {
          email,
          confirmed: email_verified,
          userName: name,
          profilePicture: picture,
          provider: ProviderEnum.google,
        },
      });
    }

    //log in
    if (user.provider == ProviderEnum.system) {
      throw new Error("please log in on system only", { cause: 400 });
    }

    const access_token = GenerateToken({
      payload: { id: user._id, email: user.email },
      secret_key: SECRET_KEY,
      options: {
        expiresIn: "1day",
        // notBefore:60*60,
        // jwtid:uuidv4()
      },
    });

    res.status(201).json({ message: "success login", data: { access_token } });

    // res.status(201).json({ message: "done", user });
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
    const match = Compare({ plainText: password, cipherText: user.password });
    if (!match) {
      return res.status(400).json({ message: "invalid password" });
    }
    const access_token = GenerateToken({
      payload: { id: user._id, email: user.email },
      secret_key: process.env.SECRET_KEY,
      options: {
        expiresIn: 60 * 10,
        // notBefore:60*60,
        // jwtid:uuidv4()
      },
    });
    res.status(201).json({ message: "success login", data: { access_token } });
  } catch (error) {
    res.status(404).json({ message: error.message, stack: error.stack });
  }
};
export const getProfile = async (req, res, next) => {
  try {
    res.status(201).json({
      message: "done",
      data: req.user,
    });
  } catch (error) {
    res.status(404).json({ message: error.message, stack: error.stack });
  }
};
