import express from "express";
import { getContestants } from "./Contestant.controller";

const router = express.Router();
router.get("/contestants", getContestants);

export default router;
