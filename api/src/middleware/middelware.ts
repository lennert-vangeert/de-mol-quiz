import compression from "compression";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import passport from "passport";

const registerMiddleware = (app: Express) => {
  // Enable CORS
  app.use(cors());

  // JSON parser middleware
  app.use(express.json());

  // Initialize Passport before defining routes!
  app.use(passport.initialize());

  // Helmet for security HTTP headers
  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.xssFilter());

  // Compression middleware
  app.use(compression());
};

export { registerMiddleware };
