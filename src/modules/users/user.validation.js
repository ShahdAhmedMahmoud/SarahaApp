import joi from "joi";
import { GenderEnum } from "../../common/enum/user.enum.js";
export const signUpSchema = {
  body: joi
    .object({
      userName: joi.string().min(10).max(20).required(),
      email: joi.string().email(),
      password: joi.string().min(10),
      age: joi.number().min(16).max(100).integer().positive().required(),
      gender: joi
        .string()
        .valid(...Object.values(GenderEnum))
        .required(),
      phone: joi.string().min(10).max(15).required(),
    })
    .required(),
};
export const signInSchema = {
  body: joi
    .object({
      email: joi.string().email().required(),
      password: joi.string().min(10),
    })
    .required(),

  query: joi
    .object({
      x: joi.number().min(10).required(),
    })
    .required(),
};
