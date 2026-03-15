import { Router } from "express";
import * as US from "./user.service.js";
import { authenticaion } from "../../common/middleware/authentication.js";
import { validation } from "../../common/middleware/validation.js";
import * as UV from "./user.validation.js";
import { multer_host, multer_local } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";

const userRouter = Router();

userRouter.post(
  "/signup",
  multer_host(multer_enum.image).fields([
    { name: "attachment", maxCount: 1 },
    { name: "attachments", maxCount: 5 },
  ]),
  validation(UV.signUpSchema),
  US.signup,
);

userRouter.post("/signup/gmail", US.signupWithGmail);
userRouter.post("/signin", validation(UV.signInSchema), US.signIn);
userRouter.get("/refresh-token", US.refreshToken);
userRouter.get("/profile", authenticaion, US.getProfile);
userRouter.get(
  "/shareprofile/:id",
  validation(UV.shareProfileSchema),
  US.shareProfile,
);
userRouter.patch(
  "/updateprofile",
  authenticaion,
  validation(UV.updateProfileSchema),
  US.updateProfile,
);
userRouter.patch(
  "/updatepassword",
  authenticaion,
  validation(UV.updatePasswordSchema),
  US.updatePassword,
);
userRouter.post("/logout", authenticaion, US.logout);

export default userRouter;
