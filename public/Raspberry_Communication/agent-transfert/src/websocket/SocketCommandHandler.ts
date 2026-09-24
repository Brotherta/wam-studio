import type { Socket } from "socket.io";

import type winston from "winston";

import type { ConfigStore } from "../config/ConfigStore";
import { extraireConfigPersistable } from "../auth/AuthenticationProvider";
import { analyserCommandeSocket } from "../models/SocketCommand";
import { TransferState } from "../models/TransferState";

import type { TransferService } from "../services/TransferService";
import type { SocketService } from "../services/SocketService";



export class SocketCommandHandler {

  constructor(

    private readonly transferService: TransferService,

    private readonly socketService: SocketService,

    private readonly configStore: ConfigStore,

    private readonly logger: winston.Logger

  ) {}



  public attacher(socket: Socket): void {

    socket.on("command", (payload: unknown) => {

      void this.traiterCommande(socket, payload);

    });

    socket.on("message", (payload: unknown) => {

      void this.traiterCommande(socket, payload);

    });

    socket.on("subscribe", (payload: unknown) => {

      void this.traiterAbonnement(socket, payload, true);

    });

    socket.on("unsubscribe", (payload: unknown) => {

      void this.traiterAbonnement(socket, payload, false);

    });

  }



  private async traiterCommande(socket: Socket, payload: unknown): Promise<void> {

    const analyse = analyserCommandeSocket(payload);

    if (!analyse.ok) {

      this.repondreErreur(socket, analyse.error);

      return;

    }



    const commande = analyse.commande;

    try {

      if (commande.type === "subscribe") {

        this.inscrireEtSynchroniser(socket, commande.transferId);

        return;

      }

      if (commande.type === "unsubscribe") {

        this.socketService.desinscrireSocket(socket, commande.transferId);

        socket.emit("command:ack", { ok: true, type: commande.type, transferId: commande.transferId });

        return;

      }

      if (commande.type === "startTransfer") {
        this.inscrireEtSynchroniser(socket, commande.transferId);
        const configPersistable = extraireConfigPersistable(commande);
        if (Object.keys(configPersistable).length > 0) {
          this.configStore.ecrire(configPersistable);
        }
        await this.transferService.demarrerEnvoi(commande, this.configStore.lire());

        socket.emit("command:ack", { ok: true, type: commande.type, transferId: commande.transferId });

        return;

      }

      if (commande.type === "cancelTransfer") {

        this.transferService.annulerTransfert(commande.transferId);

        socket.emit("command:ack", { ok: true, type: commande.type, transferId: commande.transferId });

        return;

      }

      if (commande.type === "deleteTransfer") {

        await this.transferService.supprimerTransfertComplet(commande.transferId);

        this.socketService.desinscrireSocket(socket, commande.transferId);

        socket.emit("command:ack", { ok: true, type: commande.type, transferId: commande.transferId });

      }

    } catch (error) {

      const message = error instanceof Error ? error.message : "Commande echouee.";

      this.repondreErreur(socket, message, analyse.commande.type);

    }

  }



  private async traiterAbonnement(socket: Socket, payload: unknown, inscrire: boolean): Promise<void> {

    const analyse = analyserCommandeSocket({

      type: inscrire ? "subscribe" : "unsubscribe",

      ...(typeof payload === "object" && payload !== null ? payload : {}),

    });

    if (!analyse.ok || (analyse.commande.type !== "subscribe" && analyse.commande.type !== "unsubscribe")) {

      this.repondreErreur(socket, analyse.ok ? "Commande invalide." : analyse.error);

      return;

    }

    if (analyse.commande.type === "subscribe") {
      try {
        this.inscrireEtSynchroniser(socket, analyse.commande.transferId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Abonnement echoue.";
        this.repondreErreur(socket, message, "subscribe");
      }
      return;
    }

    this.socketService.desinscrireSocket(socket, analyse.commande.transferId);

    socket.emit("command:ack", { ok: true, type: "unsubscribe", transferId: analyse.commande.transferId });

  }



  private inscrireEtSynchroniser(socket: Socket, transferId: string): void {
    this.socketService.inscrireSocket(socket, transferId);

    const snapshot = this.transferService.obtenirSnapshot(transferId);
    if (snapshot) {
      this.socketService.envoyerSnapshot(socket, snapshot);
      this.logger.info(`Socket ${socket.id} abonne au transfert ${transferId} (etat=${snapshot.state})`);
    } else {
      // Abonnement anticipe : le client peut subscribe avant POST /upload (X-Transfer-Id).
      this.socketService.envoyerSnapshot(socket, {
        transferId,
        state: TransferState.IDLE,
        originalFilename: "",
        storedFilename: "",
        size: 0,
      });
      this.logger.info(`Socket ${socket.id} abonne anticipe au transfert ${transferId} (en attente upload)`);
    }

    socket.emit("command:ack", { ok: true, type: "subscribe", transferId });
  }



  private repondreErreur(socket: Socket, message: string, type?: string): void {

    socket.emit("command:ack", { ok: false, type, error: message });

    socket.emit("agent:event", { type: "error", message });

    this.logger.warn(`Commande Socket.IO refusee: ${message}`);

  }

}


