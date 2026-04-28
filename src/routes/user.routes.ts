import { Hono } from "hono";
import { registerUser, login } from "../controllers/user/user.controller"; 
import { verifyEmail } from "../lib/auth";

const userRouter = new Hono();

userRouter.post("/register", registerUser);
userRouter.post("/login", login);
userRouter.post("/auth/hooks", verifyEmail);

export default userRouter;