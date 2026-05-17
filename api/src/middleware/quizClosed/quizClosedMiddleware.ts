import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../auth/authMiddleware";
import ConfigModel from "../../modules/Config/Config.model";

export const QUIZ_CLOSED_CODE = "QUIZ_CLOSED";

export const quizClosedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;
    if (user?.role === "ADMIN") return next();

    const config = await ConfigModel.findOne({}).select("isClosed").lean();
    if (config?.isClosed) {
      return res.status(423).json({
        code: QUIZ_CLOSED_CODE,
        message: "De quiz is gesloten.",
      });
    }
    next();
  } catch (e) {
    next(e);
  }
};
