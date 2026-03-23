import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

const colorForStatus = (statusCode: number): string => {
    if (statusCode >= 500) return "\x1b[31m";
    if (statusCode >= 400) return "\x1b[33m";
    if (statusCode >= 300) return "\x1b[36m";
    return "\x1b[32m";
};

const RESET = "\x1b[0m";

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const startedAt = process.hrtime.bigint();

    logger.debug("Incoming request", {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
    });

    res.on("finish", () => {
        const finishedAt = process.hrtime.bigint();
        const durationMs = Number(finishedAt - startedAt) / 1_000_000;

        const payload = {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Number(durationMs.toFixed(1)),
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };

        const statusColor = colorForStatus(res.statusCode);
        const message = `${req.method} ${req.originalUrl} ${statusColor}${res.statusCode}${RESET} (${durationMs.toFixed(1)}ms)`;

        if (res.statusCode >= 500) {
            logger.error(message, payload);
            return;
        }

        if (res.statusCode >= 400) {
            logger.warn(message, payload);
            return;
        }

        logger.info(message, payload);
    });

    next();
};
