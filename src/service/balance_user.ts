import { Request, Response } from "express";
import { WalletTable } from "../model/wallet_table";

export const balanceUser = async (req: Request, res: Response) => {
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
};
