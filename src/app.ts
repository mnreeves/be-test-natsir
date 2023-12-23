import Express, { Application, NextFunction, Request, Response } from "express";
import Cors from "cors";
import Dotenv from "dotenv";
import { body, validationResult } from "express-validator";
import {
  Model,
  InferAttributes,
  Sequelize,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";

// config
Dotenv.config();

// database
const DB_HOST = process.env.DB_HOST ?? "";
const DB_USER = process.env.DB_USER ?? "";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
const DB_NAME = process.env.DB_NAME ?? "";

const dbConnection = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

(async () => {
  try {
    await dbConnection.authenticate();
    console.log("database has been established successfully");
  } catch (error: any) {
    console.error("database connection failed:", error.message);
    process.exit(1);
  }
})();

class UserTable extends Model<
  InferAttributes<UserTable>,
  InferCreationAttributes<UserTable>
> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;
}

UserTable.init(
  {
    id: {
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

// app
const PORT = process.env.PORT;
const API_KEY = process.env.API_KEY;
const app: Application = Express();

app.use(Cors());
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));

// middleware
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
  // todo:
  // add validation max length
  // add validation can not containts space
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

// routes
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
