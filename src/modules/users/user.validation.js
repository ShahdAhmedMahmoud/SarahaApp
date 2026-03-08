import joi from "joi";
import { GenderEnum } from "../../common/enum/user.enum.js";
import { general_rules } from "../../common/utils/generalRules.js";
export const signUpSchema = {
  body: joi
    .object({
      userName: joi.string().trim().min(3).required(),
      email: general_rules.email.required(),
      password: general_rules.password.required(),
      age: joi.number().min(16).max(100).integer().positive().required(),
      gender: joi
        .string()
        .valid(...Object.values(GenderEnum))
        .required(),
      phone: joi.string().min(10).max(15).required(),
    })
    .required().messages({
      "any.required": "body must not be empty",
    }),

//     file: general_rules.file.required().messages({
//   "any.required": "file is required",
// }),

// files:joi.array().max(2).items(
//   general_rules.file
// ).required(),

files:joi.object({
  attachment: joi.array().max(1).items(
    general_rules.file.required().messages({
      "any.required": "attachment is required",
    })
  ).required(),

  attachments: joi.array().max(5).items(
    general_rules.file.required().messages({
      "any.required": "attachments is required",
    })
  ).required(),
}).required(),
};

export const signInSchema = {
  body: joi
    .object({
       email: joi.string().email({ tlds: { allow: true },minDomainSegments:2,maxDomainSegments:2 }).required(),
      password: joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/).required(),
    })
    .required(),
};
