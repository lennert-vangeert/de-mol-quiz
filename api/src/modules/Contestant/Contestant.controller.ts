import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import Contestant from "./Contestant.model";
import { AuthRequest } from "../../middleware/auth/authMiddleware";
import notFoundError from "../../middleware/error/NothingFoundError";

const ContestantBodySchema = z.object({
  name: z.string().trim().min(1),
});

const requireAdmin = (req: Request, res: Response): boolean => {
  const { user } = req as AuthRequest;
  if (user.role !== "ADMIN") {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
};

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

const createContestant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireAdmin(req, res)) return;
    const parsed = ContestantBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }
    const created = await Contestant.create(parsed.data);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

const updateContestant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireAdmin(req, res)) return;
    const parsed = ContestantBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }
    const updated = await Contestant.findByIdAndUpdate(
      req.params.id,
      parsed.data,
      { new: true }
    );
    if (!updated) throw new notFoundError("Contestant not found");
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

const deleteContestant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireAdmin(req, res)) return;
    const deleted = await Contestant.findByIdAndDelete(req.params.id);
    if (!deleted) throw new notFoundError("Contestant not found");
    res.status(200).json({ message: "Contestant deleted" });
  } catch (e) {
    next(e);
  }
};

export { getContestants, createContestant, updateContestant, deleteContestant };
