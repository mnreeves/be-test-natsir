import { UserTable } from "../model/user_table";
import { WalletTable } from "../model/wallet_table";

export const createWallet = async (payload: UserTable) => {
  await WalletTable.create({
    userId: payload.userId,
    balance: 0,
  });
};
