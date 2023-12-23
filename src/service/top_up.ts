import { Request, Response } from "express";
import { WalletTable } from "../model/wallet_table";
import { WalletLogTable } from "../model/wallet_log_table";

export const topUp = async (req: Request, res: Response) => {
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
};
