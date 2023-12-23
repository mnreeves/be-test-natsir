import { Request, Response } from "express";
import { WalletTable } from "../model/wallet_table";
import { UserTable } from "../model/user_table";
import { WalletLogTable } from "../model/wallet_log_table";

export const transfer = async (req: Request, res: Response) => {
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
};
