import { Hono } from "hono";
import { registerUser } from "../controllers/user/user.controller"; 

const userRouter = new Hono();

userRouter.post("/register", registerUser);

export default userRouter;