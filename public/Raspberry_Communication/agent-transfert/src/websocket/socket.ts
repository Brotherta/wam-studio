import type { Server as SocketServer } from "socket.io";
import type winston from "winston";
import type { ConfigStore } from "../config/ConfigStore";
import { TransferState } from "../models/TransferState";
import type { SocketService } from "../services/SocketService";
import type { TransferService } from "../services/TransferService";
import { SocketCommandHandler } from "./SocketCommandHandler";

export function attacherSocketIo(
  io: SocketServer,
  logger: winston.Logger,
  transferService: TransferService,
  socketService: SocketService,
  configStore: ConfigStore
): void {
  const commandHandler = new SocketCommandHandler(transferService, socketService, configStore, logger);

  io.on("connection", (socket) => {
    logger.info(`Socket.IO connecte: ${socket.id}`);
    socket.emit("agent:event", { type: "log", message: "Connecte a l'agent de transfert." });

    const transfertsActifs = transferService
      .listerTransferts()
      .filter(
        (item) =>
          item.state !== TransferState.COMPLETED &&
          item.state !== TransferState.FAILED &&
          item.state !== TransferState.CANCELLED
      );
    if (transfertsActifs.length > 0) {
      socket.emit("agent:event", {
        type: "log",
        message: `${transfertsActifs.length} transfert(s) actif(s) en memoire.`,
      });
    }

    commandHandler.attacher(socket);
  });
}
