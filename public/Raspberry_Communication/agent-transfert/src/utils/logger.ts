import winston from "winston";
import path from "path";
import fs from "fs";
import type { AppConfig } from "../config/AppConfig";

export function creerLogger(config: AppConfig): winston.Logger {
  fs.mkdirSync(config.logsDirectory, { recursive: true });
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`)
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: path.join(config.logsDirectory, "agent-transfert.log"),
      }),
    ],
  });
}
