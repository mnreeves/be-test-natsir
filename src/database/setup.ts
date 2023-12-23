import { config } from "../config/config";
import { Sequelize } from "sequelize";
import { setupTables } from "../model/setup_tables";
import { setupRelations } from "../model/setup_relations";

const { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } = config;

export const dbConnection = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

export const setupDatabase = async () => {
  await dbConnection.authenticate();

  setupTables();
  setupRelations();
};
