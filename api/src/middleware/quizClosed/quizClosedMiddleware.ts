import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../auth/authMiddleware";
import ConfigModel from "../../modules/Config/Config.model";

export const QUIZ_CLOSED_CODE = "QUIZ_CLOSED";

// Endpoints that must keep working even when the quiz is closed, so the
// frontend can still authenticate, learn the current role, and check the
// closed flag itself (which drives the takeover view).
const EXEMPT_PATHS = new Set(["/refresh", "/me", "/config"]);

export const quizClosedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (EXEMPT_PATHS.has(req.path)) return next();

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
