import Express, { Application, NextFunction, Request, Response } from "express";
import Cors from "cors";
import Dotenv from "dotenv";

Dotenv.config();

const PORT = process.env.PORT;
const API_KEY = process.env.API_KEY;
const app: Application = Express();

app.use(Cors());
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));

const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header("Authorization");

  if (apiKey !== API_KEY) {
    return res.status(401).json({
      statusCode: 401,
      statusMessage: "unauthorized",
      statusDescription: "please ensure you have the correct api key",
    });
  }

  next();
};

app.post("/v1/user/create", apiKeyMiddleware, async (req, res) => {
  res.status(200).send({
    message: "okay",
    result: req.body,
  });
});

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
