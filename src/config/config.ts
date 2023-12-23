import Dotenv from "dotenv";

Dotenv.config();

export const config = {
  API_KEY: process.env.API_KEY ?? "",
  DB_HOST: process.env.DB_HOST ?? "",
  DB_USER: process.env.DB_USER ?? "",
  DB_PASSWORD: process.env.DB_PASSWORD ?? "",
  DB_NAME: process.env.DB_NAME ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  PORT: process.env.PORT ?? 8004,
};
