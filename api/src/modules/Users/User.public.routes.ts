import { Router } from "express";
import { authLocal } from "../../middleware/auth/authMiddleware";
import { login, register, unsubscribeFromEmails } from "./User.controller";

const userPublicRouter = Router();
userPublicRouter.post("/login", authLocal, login);
userPublicRouter.post("/register", register);
userPublicRouter.post("/unsubscribe", unsubscribeFromEmails);

export default userPublicRouter;
