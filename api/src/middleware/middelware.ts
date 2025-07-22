import compression from "compression";
import cors, { CorsOptions } from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import passport from "passport";
import healthRoutes from "../modules/Health/Health.routes";

const registerMiddleware = (app: Express) => {
  // —————————————————————————————
  // Enable CORS only for front-end origins,
  // —————————————————————————————
  app.use("/", healthRoutes);
  const allowedOrigins = (
    process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:4000"]
  ).map((o) => o.trim());
  const isDev = process.env.ENVIRONMENT === "dev";

  const corsOptions: CorsOptions = {
    origin: (incomingOrigin, callback) => {
      // No Origin header (e.g. curl / Postman)
      if (!incomingOrigin) {
        if (isDev) {
          return callback(null, true);
        } else {
          return callback(new Error("CORS policy: no‑origin requests"), false);
        }
      }

      // Browser requests: must match your whitelist
      if (allowedOrigins.includes(incomingOrigin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS policy: origin ${incomingOrigin} not allowed`),
        false
      );
    },
    credentials: true, // if you need to send/receive cookies or auth headers
  };

  app.use(cors(corsOptions));

  // —————————————————————————————
  // Disable all traffic to the API if not active
  // —————————————————————————————
  const isActive = process.env.ISACTIVE === "true";

  if (!isActive) {
    app.use((req, res, next) => {
      res.status(503).json({
        message: "The API is currently inactive.",
      });
    });
    return;
  }
  // —————————————————————————————
  // JSON parser middleware
  // —————————————————————————————
  app.use(express.json());

  // —————————————————————————————
  // Passport (for JWT/auth) must come before your routes
  // —————————————————————————————
  app.use(passport.initialize());

  // —————————————————————————————
  // Helmet for security HTTP headers
  // —————————————————————————————
  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.xssFilter());

  // —————————————————————————————
  // Compression middleware
  // —————————————————————————————
  app.use(compression());
};

export { registerMiddleware };
