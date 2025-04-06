import { NextFunction, Request, Response } from "express";
import { startTime } from "../../server";

export const healthCheck = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({ message: `API is running since: ${startTime}` });
  } catch (err) {
    next(err);
  }
};
