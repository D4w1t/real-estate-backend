import express from "express";
import multer from "multer";

import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/propertyControllers.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  createProperty,
);

export default router;
