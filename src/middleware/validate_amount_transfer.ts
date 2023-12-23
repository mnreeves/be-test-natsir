import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateAmountTransfer = [
  body("amount")
    .notEmpty()
    .withMessage("amount is required")
    .toInt()
    .isInt({ min: 1, max: 10000000 })
    .withMessage(
      "amount should be integer and greater than 0 or less than 10,000,000"
    ),

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

    req.amount = req.body.amount;
    next();
  },
];
