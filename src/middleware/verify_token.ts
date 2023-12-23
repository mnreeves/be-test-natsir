import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = config;

interface decodedToken {
  userId: string;
  username: string;
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      statusMessage: "unauthorized",
      statusDescription: "access token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as decodedToken;
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      statusMessage: "unauthorized",
      statusDescription: "token is invalid",
    });
  }
};
