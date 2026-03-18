import { NextFunction, Request, Response } from "express";
import ConfigModel from "./Config.model";
import { AuthRequest } from "../../middleware/auth/authMiddleware";

const getConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthRequest;
    if (user.role !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });
    const config = await ConfigModel.findOne({});
    res.json(config ?? { week: 0, season: 0 });
  } catch (e) {
    next(e);
  }
};

const updateConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as AuthRequest;
    if (user.role !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });
    const updated = await ConfigModel.findOneAndUpdate({}, req.body, {
      upsert: true,
      new: true,
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

export { getConfig, updateConfig };
