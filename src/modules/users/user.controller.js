import { Router } from "express";
import * as US from "./user.service.js";
import { authenticaion } from "../../common/middleware/authentication.js";

const userRouter = Router();
userRouter.post("/signup", US.signup);
userRouter.post("/signin", US.signIn);
userRouter.get("/profile",authenticaion, US.getProfile);

export default userRouter;
