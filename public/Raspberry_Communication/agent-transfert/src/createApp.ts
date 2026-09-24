import path from "path";
import fs from "fs";
import http from "http";
import express from "express";
import { Server as SocketServer } from "socket.io";
import type winston from "winston";
import { creerConfigurationParDefaut, type AppConfig } from "./config/AppConfig";
import { ConfigStore } from "./config/ConfigStore";
import { REMOTE_SONS_DIRECTORY } from "./config/RemotePathConvention";
import { UploadController } from "./controllers/UploadController";
import { creerRoutesUpload } from "./routes/upload.routes";
import { ScpService } from "./services/ScpService";
import { TempFileManager } from "./services/TempFileManager";
import { TransferRegistry } from "./services/TransferRegistry";
import { TransferService } from "./services/TransferService";
import { SocketService } from "./services/SocketService";
import { UploadService } from "./services/UploadService";
import { creerLogger } from "./utils/logger";
import { attacherSocketIo } from "./websocket/socket";
import { corsPourWam } from "./middleware/corsPourWam";
import { RemoteFilesService } from "./services/RemoteFilesService";
import { creerRoutesRemote } from "./routes/remote.routes";

export type ApplicationAgent = {
  app: express.Express;
  server: http.Server;
  io: SocketServer;
  config: AppConfig;
  logger: winston.Logger;
  transferService: TransferService;
  uploadService: UploadService;
  configStore: ConfigStore;
  tempFileManager: TempFileManager;
  scpService: ScpService;
  racineProjet: string;
};

export type OptionsApplication = {
  scpService?: ScpService;
};

export function creerApplication(options?: OptionsApplication): ApplicationAgent {
  const racineProjet = path.resolve(__dirname, "..");
  const config = creerConfigurationParDefaut();
  const logger = creerLogger(config);
  const configStore = new ConfigStore(racineProjet);
  const tempFileManager = new TempFileManager(config);

  fs.mkdirSync(config.tempDirectory, { recursive: true });

  const registry = new TransferRegistry();
  const app = express();
  const server = http.createServer(app);
  const io = new SocketServer(server, {
    cors: {
      origin: true,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });
  io.engine.on("headers", (headers, req) => {
    const origin = req.headers.origin;
    headers["Access-Control-Allow-Origin"] = origin || "*";
    if (origin) {
      headers.Vary = "Origin";
    }
    headers["Cross-Origin-Resource-Policy"] = "cross-origin";
  });
  const socketService = new SocketService(io);
  const scpService = options?.scpService ?? new ScpService(logger);
  const transferService = new TransferService(
    registry,
    socketService,
    logger,
    config,
    scpService,
    tempFileManager
  );
  const uploadService = new UploadService(transferService, config, logger, tempFileManager);
  const uploadController = new UploadController(uploadService);
  const remoteFilesService = new RemoteFilesService(logger);

  attacherSocketIo(io, logger, transferService, socketService, configStore);

  app.use(corsPourWam);
  app.use(express.json());
  app.use("/upload", creerRoutesUpload(uploadController, transferService));
  app.use("/remote", creerRoutesRemote(remoteFilesService));
  app.use(express.static(path.join(racineProjet, "public", "test-client")));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "raspberry-agent-transfert",
      phase: 7,
      httpPort: config.httpPort,
      maxUploadBytes: config.maxUploadBytes,
      transfertsEnMemoire: transferService.listerTransferts().length,
      remoteSonsDirectory: REMOTE_SONS_DIRECTORY,
      configPersistee: configStore.lire(),
    });
  });

  return {
    app,
    server,
    io,
    config,
    logger,
    transferService,
    uploadService,
    configStore,
    tempFileManager,
    scpService,
    racineProjet,
  };
}

export function demarrerServeur(agent: ApplicationAgent): void {
  agent.server.listen(agent.config.httpPort, () => {
    agent.logger.info(`Agent de transfert demarre sur http://localhost:${agent.config.httpPort}`);
    agent.logger.info(`Dossier distant Raspberry: ${REMOTE_SONS_DIRECTORY}`);
    agent.logger.info(`Upload HTTP: POST http://localhost:${agent.config.httpPort}/upload`);
    agent.logger.info(`SCP atomique (.part puis rename) via ssh2/SFTP`);
    agent.logger.info(`Client de test: http://localhost:${agent.config.httpPort}/`);
  });
}
