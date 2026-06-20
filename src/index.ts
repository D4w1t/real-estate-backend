import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();

import { authMiddleware } from "./middleware/authMiddleware.js";

/* ROUTE IMPORTS */
import tenantRoutes from "./routes/tenantRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";

/* CONFIGURATIONS */
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

/* SERVER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
