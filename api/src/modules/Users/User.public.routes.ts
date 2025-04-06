import { Router } from "express";
import { login, register } from "./User.controller";
import { authLocal } from "../../middleware/auth/authMiddleware";

const router = Router();
router.post("/login", authLocal, login);
router.post("/register", register);

export default router;
