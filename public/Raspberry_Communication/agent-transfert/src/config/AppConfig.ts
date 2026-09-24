import path from "path";
import { REMOTE_SONS_DIRECTORY } from "./RemotePathConvention";

export type AppConfig = {
  httpPort: number;
  tempDirectory: string;
  logsDirectory: string;
  remoteSonsDirectory: string;
  maxUploadBytes: number;
};

export function creerConfigurationParDefaut(): AppConfig {
  const racine = path.resolve(__dirname, "..", "..");
  return {
    httpPort: Number.parseInt(process.env.AGENT_TRANSFERT_PORT || "3100", 10),
    tempDirectory: path.join(racine, "temp"),
    logsDirectory: path.join(racine, "logs"),
    remoteSonsDirectory: REMOTE_SONS_DIRECTORY,
    maxUploadBytes: 4 * 1024 * 1024 * 1024,
  };
}
