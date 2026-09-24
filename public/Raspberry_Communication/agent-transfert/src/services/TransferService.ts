import type winston from "winston";
import { creerAuthentificationDepuisCommande } from "../auth/AuthenticationProvider";
import type { AppConfig } from "../config/AppConfig";
import type { ConfigPersistee } from "../config/ConfigStore";
import {
  extraireExtensionDepuisNomFichier,
  resoudreCheminsDistant,
} from "../config/RemotePathConvention";
import type { ISocketNotifier } from "../interfaces/ISocketNotifier";
import type { ITransferRepository } from "../interfaces/ITransferRepository";
import type { ITempFileManager } from "../interfaces/ITempFileManager";
import type { CommandeStartTransfer } from "../models/SocketCommand";
import { fusionnerCibleSsh } from "../models/SocketCommand";
import type { Transfer } from "../models/Transfer";
import type { TransferSnapshot } from "../models/TransferSnapshot";
import { TransferState, transitionAutorisee } from "../models/TransferState";
import { ProgressTracker } from "../utils/ProgressTracker";
import type { ScpService } from "./ScpService";

type SessionEnvoi = {
  abortController: AbortController;
  annulerConnexion?: () => void;
};

export class TransferService {
  private readonly progressionParTransfert = new Map<string, ProgressTracker>();
  private readonly derniereProgression = new Map<
    string,
    { phase: "upload" | "scp"; current: number; total: number; percent: number }
  >();
  private readonly sessionsEnvoi = new Map<string, SessionEnvoi>();

  constructor(
    private readonly registry: ITransferRepository,
    private readonly socket: ISocketNotifier,
    private readonly logger: winston.Logger,
    private readonly _config: AppConfig,
    private readonly scpService: ScpService,
    private readonly tempFiles: ITempFileManager
  ) {}

  public enregistrerTransfert(transfer: Transfer): void {
    this.registry.save(transfer);
  }

  public obtenirTransfert(transferId: string): Transfer | undefined {
    return this.registry.findById(transferId);
  }

  public listerTransferts(): Transfer[] {
    return this.registry.list();
  }

  public supprimerTransfert(transferId: string): boolean {
    this.progressionParTransfert.delete(transferId);
    this.derniereProgression.delete(transferId);
    this.sessionsEnvoi.delete(transferId);
    return this.registry.delete(transferId);
  }

  public obtenirSnapshot(transferId: string): TransferSnapshot | undefined {
    const transfer = this.registry.findById(transferId);
    if (!transfer) {
      return undefined;
    }
    return {
      transferId: transfer.id,
      state: transfer.state,
      originalFilename: transfer.originalFilename,
      storedFilename: transfer.storedFilename,
      size: transfer.size,
      errorMessage: transfer.errorMessage,
      remoteFilename: transfer.remoteFilename,
      remotePathFinal: transfer.remotePathFinal,
      nommageDistant: transfer.nommageDistant,
      derniereProgression: this.derniereProgression.get(transferId),
    };
  }

  public changerEtat(transferId: string, nouvelEtat: TransferState, messageErreur?: string): void {
    const transfer = this.registry.findById(transferId);
    if (!transfer) {
      return;
    }
    if (!transitionAutorisee(transfer.state, nouvelEtat)) {
      throw new Error(`Transition interdite: ${transfer.state} -> ${nouvelEtat}`);
    }
    transfer.state = nouvelEtat;
    transfer.updatedAtMs = Date.now();
    if (messageErreur) {
      transfer.errorMessage = messageErreur;
    }
    this.registry.save(transfer);
    this.socket.emit(transferId, { type: "state", state: nouvelEtat });
    this.logger.info(`Transfert ${transferId} -> ${nouvelEtat}`);
  }

  public marquerEchec(transferId: string, message: string): void {
    const transfer = this.registry.findById(transferId);
    if (!transfer) {
      return;
    }
    transfer.state = TransferState.FAILED;
    transfer.errorMessage = message;
    transfer.updatedAtMs = Date.now();
    this.registry.save(transfer);
    this.socket.emit(transferId, { type: "error", message });
    this.socket.emit(transferId, { type: "state", state: TransferState.FAILED });
    this.logger.error(`Transfert ${transferId} echoue: ${message}`);
  }

  public marquerAnnule(transferId: string, message = "Transfert annule par l'utilisateur."): void {
    const transfer = this.registry.findById(transferId);
    if (!transfer) {
      return;
    }
    if (transfer.state === TransferState.COMPLETED || transfer.state === TransferState.CANCELLED) {
      return;
    }
    transfer.state = TransferState.CANCELLED;
    transfer.errorMessage = message;
    transfer.updatedAtMs = Date.now();
    this.registry.save(transfer);
    this.socket.emit(transferId, { type: "state", state: TransferState.CANCELLED });
    this.logger.info(`Transfert ${transferId} annule`);
  }

  public initialiserProgression(transferId: string, tailleTotale: number): void {
    this.progressionParTransfert.set(transferId, new ProgressTracker(tailleTotale > 0 ? tailleTotale : 1));
  }

  public notifierProgressionUpload(transferId: string, octetsEcrits: number, tailleTotale: number): void {
    this.emittreProgression(transferId, "upload", octetsEcrits, tailleTotale);
  }

  public notifierProgressionScp(transferId: string, octetsTransferts: number, tailleTotale: number): void {
    this.emittreProgression(transferId, "scp", octetsTransferts, tailleTotale);
  }

  private emittreProgression(
    transferId: string,
    phase: "upload" | "scp",
    octetsCourants: number,
    tailleTotale: number
  ): void {
    let tracker = this.progressionParTransfert.get(transferId);
    if (!tracker) {
      tracker = new ProgressTracker(tailleTotale > 0 ? tailleTotale : 1);
      this.progressionParTransfert.set(transferId, tracker);
    }
    const total = tailleTotale > 0 ? tailleTotale : Math.max(octetsCourants, 1);
    const progression = tracker.tick(Math.min(octetsCourants, total));
    const evenement = {
      type: "progress" as const,
      phase,
      current: progression.current,
      total: tailleTotale > 0 ? progression.total : octetsCourants,
      percent: tailleTotale > 0 ? progression.percent : 0,
      speed: progression.speed,
      remainingSeconds: progression.remainingSeconds,
    };
    this.derniereProgression.set(transferId, {
      phase,
      current: evenement.current,
      total: evenement.total,
      percent: evenement.percent,
    });
    this.socket.emit(transferId, evenement);
  }

  public terminerProgressionUpload(transferId: string): void {
    this.progressionParTransfert.delete(transferId);
  }

  public async demarrerEnvoi(
    commande: CommandeStartTransfer,
    configPersistee: ConfigPersistee
  ): Promise<void> {
    const transferId = commande.transferId;
    const transfer = this.registry.findById(transferId);
    if (!transfer) {
      throw new Error(`Transfert introuvable: ${transferId}`);
    }
    if (transfer.state !== TransferState.READY) {
      throw new Error(`Transfert non pret (etat actuel: ${transfer.state}).`);
    }
    if (!transfer.localPath) {
      throw new Error("Fichier local introuvable pour ce transfert.");
    }
    if (this.sessionsEnvoi.has(transferId)) {
      throw new Error("Un envoi est deja en cours pour ce transfert.");
    }

    const extension = extraireExtensionDepuisNomFichier(transfer.storedFilename || transfer.originalFilename);
    const chemins = resoudreCheminsDistant({
      raspberryId: commande.remotePath ? undefined : commande.raspberryId,
      sonNumber: commande.remotePath ? undefined : commande.sonNumber,
      varianteIndex: commande.varianteIndex,
      extension,
      remotePath: commande.remotePath,
    });

    if (!commande.remotePath) {
      if (!commande.raspberryId || !commande.sonNumber) {
        throw new Error("raspberryId et sonNumber requis sans remotePath.");
      }
      transfer.nommageDistant = {
        raspberryId: commande.raspberryId,
        sonNumber: commande.sonNumber,
        varianteIndex: commande.varianteIndex,
      };
    } else {
      transfer.nommageDistant = undefined;
    }
    transfer.cibleSsh = fusionnerCibleSsh(commande, configPersistee);
    transfer.remoteFilename = chemins.remoteFilename;
    transfer.remotePathFinal = chemins.remotePathFinal;
    transfer.remotePathPart = chemins.remotePathPart;
    this.registry.save(transfer);

    const authProvider = creerAuthentificationDepuisCommande(commande, configPersistee);

    this.changerEtat(transferId, TransferState.SENDING);
    this.initialiserProgression(transferId, transfer.size);

    const abortController = new AbortController();
    this.sessionsEnvoi.set(transferId, { abortController });

    try {
      await this.scpService.envoyerFichierAtomique({
        transferId,
        authProvider,
        localPath: transfer.localPath,
        remotePathFinal: transfer.remotePathFinal,
        remotePathPart: transfer.remotePathPart,
        remoteDirectory: chemins.remoteDirectory,
        tailleTotale: transfer.size,
        signal: abortController.signal,
        onProgression: (courant, total) => {
          this.notifierProgressionScp(transferId, courant, total);
        },
        enregistrerAnnulation: (fermerConnexion) => {
          const session = this.sessionsEnvoi.get(transferId);
          if (session) {
            session.annulerConnexion = fermerConnexion;
          }
        },
      });

      if (abortController.signal.aborted) {
        this.marquerAnnule(transferId);
        return;
      }

      this.changerEtat(transferId, TransferState.COMPLETED);
      this.socket.emit(transferId, { type: "completed" });
      this.progressionParTransfert.delete(transferId);
      this.logger.info(`Transfert ${transferId} termine sur ${transfer.remotePathFinal}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Echec envoi SCP.";
      this.logger.error(`Transfert ${transferId} erreur detaillee`, {
        message,
        cible: transfer.cibleSsh,
        remotePathFinal: transfer.remotePathFinal,
        remoteDirectory: chemins.remoteDirectory,
      });
      if (abortController.signal.aborted || message.toLowerCase().includes("annul")) {
        this.marquerAnnule(transferId, message);
      } else {
        this.marquerEchec(transferId, message);
      }
    } finally {
      this.sessionsEnvoi.delete(transferId);
    }
  }

  public annulerTransfert(transferId: string): void {
    const session = this.sessionsEnvoi.get(transferId);
    if (session) {
      session.abortController.abort();
      session.annulerConnexion?.();
      return;
    }

    const transfer = this.registry.findById(transferId);
    if (!transfer) {
      throw new Error(`Transfert introuvable: ${transferId}`);
    }
    if (
      transfer.state === TransferState.COMPLETED ||
      transfer.state === TransferState.FAILED ||
      transfer.state === TransferState.CANCELLED
    ) {
      throw new Error(`Impossible d'annuler un transfert en etat ${transfer.state}.`);
    }
    this.marquerAnnule(transferId);
  }

  public async supprimerTransfertComplet(transferId: string): Promise<void> {
    const transfer = this.registry.findById(transferId);
    if (!transfer) {
      throw new Error(`Transfert introuvable: ${transferId}`);
    }
    if (transfer.state === TransferState.SENDING || transfer.state === TransferState.RECEIVING) {
      this.annulerTransfert(transferId);
    }
    await this.tempFiles.supprimerFichier(transferId);
    this.supprimerTransfert(transferId);
    this.socket.emitGlobal({ type: "log", message: `Transfert ${transferId} supprime.` });
    this.logger.info(`Transfert ${transferId} supprime du registre`);
  }
}
