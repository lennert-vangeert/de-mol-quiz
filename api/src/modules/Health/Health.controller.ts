import { NextFunction, Request, Response } from "express";

export const healthCheck = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({ message: `API is running.` });
  } catch (err) {
    next(err);
  }
};
