import { Hono } from "hono";
import {getMaterialDetails, buyMaterial} from "../controllers/purchase-material/purchase-material.controller";

const purchaseRouter = new Hono();

purchaseRouter.get("/get-details", getMaterialDetails);
purchaseRouter.post("/purchase", buyMaterial);

export default purchaseRouter;