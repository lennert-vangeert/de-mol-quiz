type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const levelOrder: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

const parseLogLevel = (value: string | undefined): LogLevel => {
    if (!value) return "info";
    const normalized = value.toLowerCase();
    if (normalized === "debug") return "debug";
    if (normalized === "info") return "info";
    if (normalized === "warn") return "warn";
    if (normalized === "error") return "error";
    return "info";
};

const activeLevel = parseLogLevel(import.meta.env.VITE_LOG_LEVEL);

const shouldLog = (level: LogLevel) => {
    return levelOrder[level] >= levelOrder[activeLevel];
};

const styleByLevel: Record<LogLevel, string> = {
    debug: "color:#06b6d4;font-weight:600",
    info: "color:#16a34a;font-weight:600",
    warn: "color:#d97706;font-weight:600",
    error: "color:#dc2626;font-weight:600",
};

const log = (level: LogLevel, message: string, context?: LogContext) => {
    if (!shouldLog(level)) return;

    const tag = `[${level.toUpperCase()}]`;
    if (context) {
        console.log(`%c${tag}%c ${message}`, styleByLevel[level], "", context);
        return;
    }

    console.log(`%c${tag}%c ${message}`, styleByLevel[level], "");
};

export const logger = {
    debug: (message: string, context?: LogContext) => log("debug", message, context),
    info: (message: string, context?: LogContext) => log("info", message, context),
    warn: (message: string, context?: LogContext) => log("warn", message, context),
    error: (message: string, context?: LogContext) => log("error", message, context),
};
