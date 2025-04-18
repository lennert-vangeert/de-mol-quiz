import { Router } from "express";
import { getCurrentUser, getScoreBoard, refreshToken } from "./User.controller";

const router = Router();
router.get("/users/current", getCurrentUser);
router.get("/refresh", refreshToken);
router.get("/scoreBoard", getScoreBoard);

export default router;
