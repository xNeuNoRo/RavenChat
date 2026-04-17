import { pino, Logger } from "pino";
import { requestContext, LoggerContract } from "@neunoro/fastify-kit";

export class PinoLogger implements LoggerContract {
  private readonly pino: Logger;
  constructor() {
    this.pino = pino({
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV === "production"
          ? undefined
          : {
              target: "pino-pretty",
              options: { colorize: true },
            },
    });
  }

  private getContext() {
    const context = requestContext.getStore();
    return context ? Object.fromEntries(context) : {};
  }

  info(message: string, context?: Record<string, any>) {
    this.pino.info({ ...this.getContext(), ...context }, message);
  }

  error(message: string, context?: Record<string, any>) {
    this.pino.error({ ...this.getContext(), ...context }, message);
  }

  warn(message: string, context?: Record<string, any>) {
    this.pino.warn({ ...this.getContext(), ...context }, message);
  }

  debug(message: string, context?: Record<string, any>) {
    this.pino.debug({ ...this.getContext(), ...context }, message);
  }

  fatal(message: string, context?: Record<string, any>): void {
    this.pino.fatal({ ...this.getContext(), ...context }, message);
  }
}
