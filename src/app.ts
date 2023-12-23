import Express, { Application } from "express";
import Cors from "cors";

import { setupDatabase } from "./database/setup";
import { config } from "./config/config";
import { v1Router } from "./router/v1_router";

(async () => {
  try {
    await setupDatabase();
    console.log("database has been established successfully");
  } catch (error: any) {
    console.error("database connection failed:", error.message);
    process.exit(1);
  }
})();

const { PORT } = config;
const app: Application = Express();

app.use(Cors());
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));
app.use("/v1", v1Router);

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
