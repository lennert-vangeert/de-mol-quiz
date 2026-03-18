import { Router } from "express";
import { getCurrentUser, getScoreBoard, getFullScoreBoard, refreshToken, unsubscribeFromEmails } from "./User.controller";

const router = Router();
router.get("/users/current", getCurrentUser);
router.get("/refresh", refreshToken);
router.get("/scoreBoard/all", getFullScoreBoard);
router.get("/scoreBoard", getScoreBoard);
router.post("/unsubscribe", unsubscribeFromEmails);

export default router;
