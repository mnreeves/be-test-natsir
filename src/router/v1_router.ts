import Express from "express";
import { validateApiKey } from "../middleware/validate_api_key";
import { validateCreateUserBody } from "../middleware/validate_create_user_body";
import { createUser } from "../service/create_user";
import { verifyToken } from "../middleware/verify_token";
import { balanceUser } from "../service/balance_user";
import { validateAmountTopUp } from "../middleware/validate_amount_top_up";
import { topUp } from "../service/top_up";
import { validateAmountTransfer } from "../middleware/validate_amount_transfer";
import { validateTransferBody } from "../middleware/validate_transfer_body";
import { transfer } from "../service/transfer";

export const v1Router = Express.Router();

v1Router.post(
  "/user/create",
  validateApiKey,
  validateCreateUserBody,
  createUser
);
v1Router.get("/user/balance", verifyToken, balanceUser);
v1Router.post("/user/balance", verifyToken, validateAmountTopUp, topUp);
v1Router.post(
  "/user/transfer",
  verifyToken,
  validateAmountTransfer,
  validateTransferBody,
  transfer
);
