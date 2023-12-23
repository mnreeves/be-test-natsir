import Dotenv from "dotenv";

Dotenv.config();

export const config = {
  API_KEY: process.env.API_KEY ?? "",
};
