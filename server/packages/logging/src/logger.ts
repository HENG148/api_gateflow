import pino, { stdSerializers, stdTimeFunctions, type DestinationStream, type Logger, type LoggerOptions } from "pino";
import { REDACT_CENSOR, REDACT_PATHS } from "./redaction.js";

export interface CreateLoggerOptions {
  service: string;
  version?: string;
  level?: string;
  extraRedact?: string[];
  destination?: DestinationStream;
}

export type { Logger };

export function createLogger(opts: CreateLoggerOptions): Logger{
  const options: LoggerOptions = {
    level: opts.level ?? "info",
    base: { service: opts.service, ...(opts.version ? { version: opts.version } : {}) },
    timestamp: stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    redact: {
      paths: [...REDACT_PATHS, ...(opts.extraRedact ?? [])],
      censor: REDACT_CENSOR,
    },
    serializers: {
      err: stdSerializers.err
    }
  };
  return opts.destination ? pino(options, opts.destination) : pino(options);
}