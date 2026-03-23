type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

const levelOrder: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

const levelColor: Record<LogLevel, string> = {
    debug: "\x1b[36m",
    info: "\x1b[32m",
    warn: "\x1b[33m",
    error: "\x1b[31m",
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

const activeLevel = parseLogLevel(process.env.LOG_LEVEL);

const shouldLog = (level: LogLevel) => {
    return levelOrder[level] >= levelOrder[activeLevel];
};

const formatContext = (context?: LogContext): string => {
    if (!context || Object.keys(context).length === 0) return "";

    try {
        return `${DIM}${JSON.stringify(context)}${RESET}`;
    } catch {
        return `${DIM}[unserializable-context]${RESET}`;
    }
};

const log = (level: LogLevel, message: string, context?: LogContext) => {
    if (!shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const levelTag = `${levelColor[level]}${level.toUpperCase().padEnd(5)}${RESET}`;
    const contextText = formatContext(context);
    const line = `${DIM}${timestamp}${RESET} ${levelTag} ${message}${contextText ? ` ${contextText}` : ""
        }`;

    if (level === "error") {
        console.error(line);
        return;
    }

    if (level === "warn") {
        console.warn(line);
        return;
    }

    console.log(line);
};

export const logger = {
    debug: (message: string, context?: LogContext) => log("debug", message, context),
    info: (message: string, context?: LogContext) => log("info", message, context),
    warn: (message: string, context?: LogContext) => log("warn", message, context),
    error: (message: string, context?: LogContext) => log("error", message, context),
};

export type { LogLevel, LogContext };
