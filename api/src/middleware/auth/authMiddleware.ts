import passport from "passport";
import { NextFunction, Request, Response } from "express";
import localStrategy from "./localStrategy";
import jwtStrategy from "./jwtStrategy";
import AuthError from "../error/autherror";
import { User } from "../../modules/Users/User.types";

passport.use("local", localStrategy);
passport.use("jwt", jwtStrategy);

export interface AuthRequest extends Request {
  user: User;
}

const passportHandler = (strategy: string) => {
  return function (req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      strategy,
      { session: false },
      function (err: any, user?: User | false) {
        console.log( strategy, err, user);
        if (err) {
          return next(err);
        }
        if (!user) {
          console.log("No user found");
          return next(new AuthError());
        } else {
          console.log("User found", user);
          req.user = user;
          return next();
        }
      }
    )(req, res, next);
  };
};

const authLocal = passportHandler("local");
const authJwt = passportHandler("jwt");

export { authLocal, authJwt };
