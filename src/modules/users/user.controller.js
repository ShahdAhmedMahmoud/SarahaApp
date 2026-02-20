import { Router } from "express";
import * as US from "./user.service.js";
import { authenticaion } from "../../common/middleware/authentication.js";
import { validation } from "../../common/middleware/validation.js";
import* as UV  from "./user.validation.js";




const userRouter = Router();
userRouter.post("/signup", validation(UV.signUpSchema), US.signup);
userRouter.post("/signup/gmail", US.signupWithGmail);
userRouter.post("/signin", validation(UV.signInSchema), US.signIn);
userRouter.get("/profile", authenticaion, US.getProfile);

export default userRouter;
