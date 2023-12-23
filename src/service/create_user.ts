import { Request, Response } from "express";
import { UserTable } from "../model/user_table";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

const { JWT_SECRET } = config;

export const createUser = async (req: Request, res: Response) => {
  try {
    const username: string = req.body.username;
    const dataUser = await UserTable.findOne({ where: { username } });
    if (dataUser !== null) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "bad request",
        statusDescription: "username already exist",
      });
    }

    const newUser = await UserTable.create({ username });
    const newUserId = newUser.userId;

    const accessTokenExpiresIn = 3600; // 1 hour in seconds
    const refreshTokenExpiresIn = 604800; // 7 days in seconds
    const now = Math.floor(Date.now() / 1000);
    const accessTokenExpiresAt = now + accessTokenExpiresIn;
    const refreshTokenExpiresAt = now + refreshTokenExpiresIn;

    const accessToken = jwt.sign(
      { userId: newUserId, username, exp: accessTokenExpiresAt },
      JWT_SECRET
    );
    const refreshToken = jwt.sign(
      { userId: newUserId, username, exp: refreshTokenExpiresAt },
      JWT_SECRET
    );

    return res.status(201).send({
      statusCode: 201,
      statusMessage: "created",
      statusDescription: "resource created",
      result: {
        data: {
          accessToken,
          accessTokenExpiresAt: new Date(accessTokenExpiresAt * 1000),
          accessTokenExpiresIn,
          refreshToken,
          refreshTokenExpiresAt: new Date(refreshTokenExpiresAt * 1000),
          refreshTokenExpiresIn,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      statusCode: 500,
      statusMessage: "internal server error",
      statusDescription: error.message ?? "",
    });
  }
};
