import { NextFunction, Request, Response } from "express";
import Contestant from "./Contestant.model";

const getContestants = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contestants = await Contestant.find({}).sort({ name: 1 });
    res.json(contestants);
  } catch (e) {
    next(e);
  }
};

export { getContestants };
