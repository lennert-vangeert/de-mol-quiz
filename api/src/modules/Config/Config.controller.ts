import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import ConfigModel from "./Config.model";
import { AuthRequest } from "../../middleware/auth/authMiddleware";

const ConfigBodySchema = z.object({
  week: z.number().int().min(0).optional(),
  season: z.number().int().min(0).optional(),
  showWinner: z.boolean().optional(),
  isClosed: z.boolean().optional(),
});

const getConfig = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await ConfigModel.findOne({});
    res.json(config ?? { week: 0, season: 0, showWinner: false, isClosed: false });
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
    const parsed = ConfigBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }
    const updated = await ConfigModel.findOneAndUpdate({}, parsed.data, {
      upsert: true,
      new: true,
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

const getActiveSeason = async (): Promise<number> => {
  const config = await ConfigModel.findOne({});
  return config?.season ?? 1;
};

export { getConfig, updateConfig, getActiveSeason };
