import express from "express";

import {
  getTenant,
  createTenant,
  updateTenant,
  getCurrentResidences,
  addFavoriteProperty,
  removeFavoriteProperty
} from "../controllers/tenantControllers.js";

const router = express.Router();

router.get("/:cognitoId", getTenant);
router.post("/", createTenant);
router.put("/:cognitoId", updateTenant);
router.get("/current-residences", getCurrentResidences);
router.post("/favorites/:propertyId", addFavoriteProperty);
router.delete("/favorites/:propertyId", removeFavoriteProperty);

export default router;
