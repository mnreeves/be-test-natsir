import {
  Model,
  InferAttributes,
  Sequelize,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";
import { dbConnection } from "../database/setup";

export class WalletTable extends Model<
  InferAttributes<WalletTable>,
  InferCreationAttributes<WalletTable>
> {
  declare walletId: CreationOptional<string>;
  declare userId: string;
  declare balance: number;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;
}

export const setupWalletTable = () => {
  WalletTable.init(
    {
      walletId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      tableName: "tb_wallets",
      underscored: true,
    }
  );
  WalletTable.sync();
};
