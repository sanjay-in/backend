import { Hono } from "hono";
import { registerUser, login, refreshToken } from "../controllers/user/user.controller"; 

const userRouter = new Hono();

userRouter.post("/register", registerUser);
userRouter.post("/login", login);
userRouter.post("/refresh-token", refreshToken);

export default userRouter;