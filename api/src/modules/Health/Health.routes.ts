import express from "express";
import { healthCheck } from "./Health.controller";

const router = express.Router();

router.get("/health", healthCheck);

export default router;
