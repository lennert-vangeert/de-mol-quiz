import compression from "compression";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";

const registerMiddleware = (app: Express) => {
  //cors
    app.use(cors())

  //json parser
  app.use(express.json());

  //helmet
    app.use(helmet.noSniff());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.xssFilter());

  //compression
  app.use(compression());
};

export { registerMiddleware };
