import { ProviderEnum, RoleEnum } from "../../common/enum/user.enum.js";
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
import {
  ACCESS_SECRET_KEY,
  PREFIX,
  REFRESH_SECRET_KEY,
  SALT_ROUNDS,
} from "../../../config/config.service.js";
import cloudinary from "../../common/utils/couldinary.js";
import revokeToken from "../../DB/models/revokeToken.model.js";
import { randomUUID } from "crypto";
import { del, get, get_key, keys, revoked_key, set } from "../../DB/redis/redis.service.js";




export const signup = async (req, res, next) => {
  try {
    const { userName, email, password, age, gender, phone } = req.body;

    console.log(req.files, "after");
    // console.log(req, "after");
    // if (!req.file) {
    //   throw new Error("profile picture is required", { cause: 400 });}
    if (await db_service.findOne({ model: userModel, filter: { email } })) {
      throw new Error("email already exist", { cause: 409 }); }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.attachment[0].path,
      {folder: "saraha_app/users",
        // public_id:"shahd",
        // use_filename:true,
}
    );
    // let arr_paths = [];
    // for (const file of req.files.attachments) {
    //   arr_paths.push(file.path);}
    const user = await db_service.create({
      model: userModel,
      data: {
        userName,
        email,
        password: Hash({
          plainText: password,
          salt_rounds: SALT_ROUNDS,
        }),
        age,
        gender,
        phone: encrypt(phone),
        profilePicture: { secure_url: secure_url, public_id: public_id },
        // coverPicture: arr_paths,
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

    const jwtid = randomUUID();
    const access_token = GenerateToken({
      payload: { id: user._id, email: user.email },
      secret_key: ACCESS_SECRET_KEY,
      options: {
        expiresIn: 60 * 5,
        jwtid 
      },
    });
    const refresh_token = GenerateToken({
      payload: { id: user._id, email: user.email },
      secret_key: REFRESH_SECRET_KEY,
      options: {
        expiresIn: "1y",
        jwtid
      },
    });

    res.status(201).json({
      message: "success login",
      data: { access_token, refresh_token },
    });
  } catch (error) {
    res.status(404).json({ message: error.message, stack: error.stack });
  }
};
export const getProfile = async (req, res, next) => {
  try {
    const key = `profile::${req.user._id}`;
    const userExist = await get(key);
    if (userExist) {

      return res.status(201).json({
        message: "done from cache",
        data: userExist,
      });
    }
    await set({ key, value: req.user, ttl: 60 * 2 });
    res.status(201).json({
      message: "done from DB",
      data: req.user,
    });

  } catch (error) {
    res.status(404).json({ message: error.message, stack: error.stack });
  }
};
export const shareProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await db_service.findOne({
      model: userModel,
      id,
      select: "-password",
    });
    if (!user) {
      throw new Error("user not exist");
    }
    user.phone = decrypt(user.phone);
    res.status(201).json({
      message: "done",
      data: user,
    });
  } catch (error) {
    res.status(404).json({ message: error.message, stack: error.stack });
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    let { firstName, lastName, gender, phone } = req.body;
    if (phone) {
      phone = encrypt(phone);
    }
    const user = await db_service.findOneAndUpdate({
      model: userModel,
      filter: { _id: req.user._id },
      update: { firstName, lastName, gender, phone },
    });
    if (!user) {
      throw new Error("user not exist");
    }
    await del(`profile::${req.user._id}`);
    // user.phone = decrypt(user.phone);
    res.status(201).json({
      message: "done",
      data: user,
    });
  } catch (error) {
    res.status(404).json({ message: error.message, stack: error.stack });
  }
};
export const updatePassword = async (req, res, next) => {
  try {
    console.log(req.body);
    let { oldPassword, newPassword } = req.body;
    console.log("password",req.user.password);
    // console.log("req",req);
    
    
    if(!Compare({plainText:oldPassword,cipherText:req.user.password})){
      console.log("old password",oldPassword);
      console.log("user password",req.user.password);
      throw new Error("invalid old password");
    }
    const hash = Hash({ plainText: newPassword });
    req.user.password = hash;
    await req.user.save();
    res.status(201).json({
      message: "done",
    });
  } catch (error) {
    res.status(404).json({ message: error.message, stack: error.stack });
  }
};



export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("token not exist");
  }
  const [prefix, token] = authorization.split(" ");
  if (prefix !== PREFIX) {
    throw new Error("invalid Token prefix");
  }

  const decoded = VerifyToken({
    token,
    secret_key: REFRESH_SECRET_KEY,
  });
  if (!decoded || !decoded?.id) {
    throw new Error("invalid token");
  }
  const user = await db_service.findOne({
    model: userModel,
    filter: { _id: decoded.id },
  });
  if (!user) {
    throw new Error("user not exist");
  }
      const isRevoked = await db_service.findOne({
        model: revokeToken,
        filter: { tokenId: decoded.jti },
      });
      if(isRevoked) {
        throw new Error("Token revoked, please login again");
      }
  const access_token = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: ACCESS_SECRET_KEY,
    options: {
      expiresIn: 60 * 10,
    },
  });
  res.status(201).json({ message: "success refresh", data: { access_token } });
};

export const logout = async (req, res, next) => {
  const { flag } = req.query;
  if (flag === "all") {
    req.user.changeCredentials = Date.now();
    await req.user.save();
    await del(await keys(get_key({userId:req.user._id})));

    // await db_service.deleteMany({
    //   model: revokeToken,
    //   filter: { userId: req.user._id },
    // });
  } else {

    await set({
      key:revoked_key({userId:req.user._id,iti:req.decoded.jti}),
      value:`${req.decoded.jti}`,
      ttl: req.decoded.exp - Math.floor(Date.now() / 1000)
    })
    // await db_service.create({
    //   model: revokeToken,
    //   data: {
    //     tokenId: req.decoded.jti,
    //     userId: req.user._id,
    //     expireAt: new Date(req.decoded.exp * 1000),
    //   },
    // });

   
  }
  res.status(201).json({ message: "success logout" });

 
};
