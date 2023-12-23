import {
  Model,
  InferAttributes,
  Sequelize,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";
import { dbConnection } from "../database/setup";

// todo: add type of log, either transfer / top up
export class WalletLogTable extends Model<
  InferAttributes<WalletLogTable>,
  InferCreationAttributes<WalletLogTable>
> {
  declare walletLogId: CreationOptional<string>;
  declare walletId: string;
  declare amount: number;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;
}

export const setupWalletLogTable = () => {
  WalletLogTable.init(
    {
      walletLogId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      walletId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    },
    {
      sequelize: dbConnection,
      timestamps: true,
      tableName: "tb_wallets_log",
      underscored: true,
    }
  );
  WalletLogTable.sync();
};
