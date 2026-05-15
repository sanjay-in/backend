import { Hono } from "hono";
import {uploadMaterial, confirmMaterial} from "../controllers/create-material/create-material.controller";

const creatorRouter = new Hono();

creatorRouter.post("/upload", uploadMaterial);
creatorRouter.post("/confirmation", confirmMaterial);

export default creatorRouter;