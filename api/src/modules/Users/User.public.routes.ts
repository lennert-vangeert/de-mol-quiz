import { Router } from "express";
import { login } from "./User.controller";
import { authLocal } from "../../middleware/auth/authMiddleware";

const router = Router();
router.post("/login", authLocal, login);

export default router;
