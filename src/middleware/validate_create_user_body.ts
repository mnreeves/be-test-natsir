import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateCreateUserBody = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 5 })
    .withMessage("username must be at least 5 characters long")
    .isLength({ max: 20 })
    .withMessage("username max 20 characters long")
    .matches(/^\S*$/)
    .withMessage("username cannot contain spaces"),

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
