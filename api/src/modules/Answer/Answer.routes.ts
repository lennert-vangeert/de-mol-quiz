import { Router } from "express";
import {
  createAnswer,
  getAnswerDetail,
} from "./Answer.controller";

const router: Router = Router();

router.get("/answers/:id", getAnswerDetail);
router.post("/answers", createAnswer);

export default router;
