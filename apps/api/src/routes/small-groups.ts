import { Router, type Router as RouterType } from "express";

import * as smallGroupsController from "../controllers/small-groups.js";

const router: RouterType = Router();

router.post("/", smallGroupsController.create);
router.get("/recent", smallGroupsController.getRecent);

export default router;
