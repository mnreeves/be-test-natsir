import {
  Model,
  InferAttributes,
  Sequelize,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";
import { dbConnection } from "../database/setup";
import { createWallet } from "../hook/create_wallet";

export class UserTable extends Model<
  InferAttributes<UserTable>,
  InferCreationAttributes<UserTable>
> {
  declare userId: CreationOptional<string>;
  declare username: string;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;
}

export const setupUserTable = () => {
  UserTable.init(
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(20),
        unique: true,
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
      tableName: "tb_users",
      underscored: true,
    }
  );

  UserTable.sync();
  UserTable.addHook("afterCreate", createWallet);
};
