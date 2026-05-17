import express from "express";
import {
  createContestant,
  deleteContestant,
  getContestants,
  updateContestant,
} from "./Contestant.controller";

const router = express.Router();
router.get("/contestants", getContestants);
router.post("/contestants", createContestant);
router.put("/contestants/:id", updateContestant);
router.delete("/contestants/:id", deleteContestant);

export default router;
