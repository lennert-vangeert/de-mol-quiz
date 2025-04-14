import { Router } from "express";
import { getCurrentUser, refreshToken } from "./User.controller";

const router = Router();
router.get("/users/current", getCurrentUser);
router.get("/refresh", refreshToken)

export default router;
