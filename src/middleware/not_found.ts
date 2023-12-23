import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    statusCode: 404,
    statusMessage: "not found",
    statusDescription: "resource not found",
  });
};
