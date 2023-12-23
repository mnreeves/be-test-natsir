import { UserTable, setupUserTable } from "./user_table";
import { WalletLogTable } from "./wallet_log_table";
import { WalletTable } from "./wallet_table";

export const setupRelations = () => {
  UserTable.hasOne(WalletTable, {
    as: "Wallet",
    foreignKey: "userId",
  });

  WalletTable.belongsTo(UserTable, {
    as: "User",
    foreignKey: "userId",
  });

  WalletTable.hasOne(WalletLogTable, {
    as: "WalletLog",
    foreignKey: "walletId",
  });

  WalletLogTable.belongsTo(WalletTable, {
    as: "Wallet",
    foreignKey: "walletId",
  });
};
