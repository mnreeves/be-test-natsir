import Express, { Application, NextFunction, Request, Response } from "express";
import Cors from "cors";
import Dotenv from "dotenv";
import { body, validationResult } from "express-validator";

import { validateApiKey } from "./middleware/validate_api_key";
import { validateCreateUserBody } from "./middleware/validate_create_user_body";
import { setupDatabase } from "./database/setup";
import { WalletTable } from "./model/wallet_table";
import { WalletLogTable } from "./model/wallet_log_table";
import { config } from "./config/config";
import { UserTable } from "./model/user_table";
import { createUser } from "./service/create_user";
import { verifyToken } from "./middleware/verify_token";
import { validateAmountTopUp } from "./middleware/validate_amount_top_up";
import { validateAmountTransfer } from "./middleware/validate_amount_transfer";

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
const { JWT_SECRET } = config;

app.use(Cors());
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));

// middleware

const validateTransferBodyMiddleware = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 5 })
    .withMessage("username must be at least 5 characters long")
    .isLength({ max: 20 })
    .withMessage("username max 20 characters long")
    .matches(/^\S*$/)
    .withMessage("username cannot contain spaces"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // could be changed the shape of response later,
      // but for now only need to take the error message
      const statusDescription =
        errors.array().length > 0
          ? errors.array()[0].msg ?? "bad request"
          : "bad request";
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "bad request",
        statusDescription,
      });
    }

    req.username = req.body.username;
    next();
  },
];

// routes
app.post("/v1/user/create", validateApiKey, validateCreateUserBody, createUser);

app.get(
  "/v1/user/balance",
  verifyToken,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "unauthorized",
        statusDescription: "user is invalid",
      });
    }

    try {
      const { userId } = req.user;

      const dataWallet = await WalletTable.findOne({ where: { userId } });
      if (dataWallet === null) {
        return res.status(404).json({
          statusCode: 404,
          statusMessage: "not found",
          statusDescription: "wallet not found",
        });
      }

      return res.status(200).send({
        statusCode: 200,
        statusMessage: "ok",
        statusDescription: "request succeded without error",
        result: {
          errorCode: "00",
          errorMessage: "success",
          data: {
            balance: dataWallet.balance,
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        statusMessage: "internal server error",
        statusDescription: error.message ?? "",
      });
    }
  }
);

app.post(
  "/v1/user/balance",
  verifyToken,
  validateAmountTopUp,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "bad request",
        statusDescription: "user is invalid",
      });
    }

    if (!req.amount) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "bad request",
        statusDescription: "amount is not valid",
      });
    }

    try {
      const { userId } = req.user;

      const dataWallet = await WalletTable.findOne({ where: { userId } });
      if (dataWallet === null) {
        return res.status(404).json({
          statusCode: 404,
          statusMessage: "not found",
          statusDescription: "wallet not found",
        });
      }

      // todo: add validation / rollback mechanism when one of operation failed
      await WalletLogTable.create({
        walletId: dataWallet.walletId,
        amount: req.amount,
      });

      await WalletTable.update(
        {
          balance: dataWallet.balance + req.amount,
        },
        { where: { userId } }
      );

      return res.status(200).send({
        statusCode: 200,
        statusMessage: "ok",
        statusDescription: "request succeded without error",
        result: {
          errorCode: "00",
          errorMessage: "success",
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        statusMessage: "internal server error",
        statusDescription: error.message ?? "",
      });
    }
  }
);

app.post(
  "/v1/user/transfer",
  verifyToken,
  validateAmountTransfer,
  validateTransferBodyMiddleware,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "bad request",
        statusDescription: "user is invalid",
      });
    }

    if (!req.username) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "bad request",
        statusDescription: "username is invalid",
      });
    }

    if (!req.amount) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "bad request",
        statusDescription: "amount is not valid",
      });
    }

    try {
      const { userId, username: senderUsername } = req.user; // sender
      const receiverUsername = req.username; // receiver
      const transferAmount = req.amount;

      // cant transfer to user itself
      if (senderUsername === receiverUsername) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "bad request",
          statusDescription: `cant top up to itself`,
        });
      }

      // sender
      const dataWalletSender = await WalletTable.findOne({ where: { userId } });
      if (dataWalletSender === null) {
        return res.status(404).json({
          statusCode: 404,
          statusMessage: "not found",
          statusDescription: "wallet sender not found",
        });
      }

      if (dataWalletSender.balance < transferAmount) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "bad request",
          statusDescription: "insufficient balance",
        });
      }

      // receiver
      const dataUserReceiver = await UserTable.findOne({
        where: { username: receiverUsername },
      });
      if (dataUserReceiver === null) {
        return res.status(404).json({
          statusCode: 404,
          statusMessage: "not found",
          statusDescription: `user ${receiverUsername} not found`,
        });
      }

      const dataWalletReceiver = await WalletTable.findOne({
        where: { userId: dataUserReceiver.userId },
      });
      if (dataWalletReceiver === null) {
        return res.status(404).json({
          statusCode: 404,
          statusMessage: "not found",
          statusDescription: `wallet ${receiverUsername} not found`,
        });
      }

      // todo: add validation / rollback mechanism when one of operation failed

      // sender
      // substract the balance
      await WalletLogTable.create({
        walletId: dataWalletSender.walletId,
        amount: -transferAmount,
      });

      await WalletTable.update(
        {
          balance: dataWalletSender.balance - transferAmount,
        },
        { where: { userId: dataWalletSender.userId } }
      );

      // receiver
      // add the balance
      await WalletLogTable.create({
        walletId: dataWalletReceiver.walletId,
        amount: transferAmount,
      });

      await WalletTable.update(
        {
          balance: dataWalletReceiver.balance + transferAmount,
        },
        { where: { userId: dataWalletReceiver.userId } }
      );

      return res.status(200).send({
        statusCode: 200,
        statusMessage: "ok",
        statusDescription: "request succeded without error",
        result: {
          errorCode: "00",
          errorMessage: "success",
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        statusCode: 500,
        statusMessage: "internal server error",
        statusDescription: error.message ?? "",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
