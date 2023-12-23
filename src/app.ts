import Express, { Application } from "express";
import Cors from "cors";
import Dotenv from "dotenv";

import { validateApiKey } from "./middleware/validate_api_key";
import { validateCreateUserBody } from "./middleware/validate_create_user_body";
import { setupDatabase } from "./database/setup";
import { createUser } from "./service/create_user";
import { verifyToken } from "./middleware/verify_token";
import { validateAmountTopUp } from "./middleware/validate_amount_top_up";
import { validateAmountTransfer } from "./middleware/validate_amount_transfer";
import { balanceUser } from "./service/balance_user";
import { validateTransferBody } from "./middleware/validate_transfer_body";
import { topUp } from "./service/top_up";
import { transfer } from "./service/transfer";

// config
Dotenv.config();

// database
// todo config should be validated

(async () => {
  try {
    await setupDatabase();
    console.log("database has been established successfully");
  } catch (error: any) {
    console.error("database connection failed:", error.message);
    process.exit(1);
  }
})();

// app
// todo config should be validated
const PORT = process.env.PORT;
const app: Application = Express();

app.use(Cors());
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));

// middleware

// routes
app.post("/v1/user/create", validateApiKey, validateCreateUserBody, createUser);
app.get("/v1/user/balance", verifyToken, balanceUser);
app.post("/v1/user/balance", verifyToken, validateAmountTopUp, topUp);
app.post(
  "/v1/user/transfer",
  verifyToken,
  validateAmountTransfer,
  validateTransferBody,
  transfer
);

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
