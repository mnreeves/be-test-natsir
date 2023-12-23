import Express, { Application, NextFunction, Request, Response } from "express";
import Cors from "cors";
import Dotenv from "dotenv";
import { body, validationResult } from "express-validator";

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

const validateCreateUserBodyMiddleware = [
  body("username")
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 5 })
    .withMessage("username must be at least 5 characters long"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // could be changed the shape of response later,
      // but for now only need to take the error message
      const statusDescription =
        errors.array().length > 0
          ? errors.array()[0].msg ?? "bad request"
          : "bad request";
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "bad request",
        statusDescription,
      });
    }

    next();
  },
];

app.post(
  "/v1/user/create",
  apiKeyMiddleware,
  validateCreateUserBodyMiddleware,
  async (req: Request, res: Response) => {
    res.status(200).send({
      message: "okay",
      result: req.body,
    });
  }
);

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
