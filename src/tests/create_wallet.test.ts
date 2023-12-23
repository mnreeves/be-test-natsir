import { createWallet } from "../hook/create_wallet";
import { WalletTable } from "../model/wallet_table";

type WalletCreationPayload = {
  userId: string;
  balance: number;
};

jest.mock("../model/wallet_table", () => ({
  WalletTable: {
    create: jest.fn(),
  },
}));

// todo
// - negative test case
// - typescript error
describe("createWallet", () => {
  it("creates a wallet", async () => {
    const payload = { userId: "user123", balance: 0 } as WalletCreationPayload;

    // @ts-ignore
    await createWallet(payload);

    expect(WalletTable.create).toHaveBeenCalledWith({
      userId: payload.userId,
      balance: 0,
    });
  });
});
