import express from "express";

import {
  getManager,
  createManager,
  updateManager,
  getManagerProperties
} from "../controllers/managerControllers.js";

const router = express.Router();

router.get("/:cognitoId", getManager);
router.post("/", createManager);
router.put("/:cognitoId", updateManager);
router.get("/:cognitoId/properties", getManagerProperties);

export default router;
