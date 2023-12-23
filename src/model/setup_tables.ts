import { setupUserTable } from "./user_table";
import { setupWalletLogTable } from "./wallet_log_table";
import { setupWalletTable } from "./wallet_table";

export const setupTables = () => {
  setupUserTable();
  setupWalletTable();
  setupWalletLogTable();
};
