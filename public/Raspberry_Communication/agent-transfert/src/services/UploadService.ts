import type { Request, Response } from "express";
import Busboy from "busboy";
import type winston from "winston";
import type { AppConfig } from "../config/AppConfig";
import { creerTransfertVide } from "../models/Transfer";
import { TransferState } from "../models/TransferState";
import { resoudreTransferIdDepuisEntete } from "../utils/transferId";
import {
  lireNommageDepuisEntetesUpload,
  resoudreCheminsDepuisNommageUpload,
} from "../utils/nommageUpload";
import { extensionAutorisee, validerFichierLocal } from "../utils/FileValidator";
import { TempFileManager } from "./TempFileManager";
import { TransferService } from "./TransferService";

export class UploadService {
  private readonly tempFiles: TempFileManager;

  constructor(
    private readonly transferService: TransferService,
    private readonly config: AppConfig,
    private readonly logger: winston.Logger,
    tempFiles?: TempFileManager
  ) {
    this.tempFiles = tempFiles ?? new TempFileManager(config);
  }

  public async traiterRequeteUpload(req: Request, res: Response): Promise<void> {
    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      res.status(400).json({ ok: false, error: "Content-Type multipart/form-data requis." });
      return;
    }

    const transferId = resoudreTransferIdDepuisEntete(req.headers["x-transfer-id"]);
    const nommageUpload = lireNommageDepuisEntetesUpload(req.headers);
    const contentLength = Number.parseInt(`${req.headers["content-length"] || "0"}`, 10);
    const tailleEstimee = Number.isFinite(contentLength) && contentLength > 0 ? contentLength : 0;

    let transfer = creerTransfertVide(transferId, "");
    this.transferService.enregistrerTransfert(transfer);
    this.transferService.changerEtat(transferId, TransferState.RECEIVING);
    this.transferService.initialiserProgression(transferId, tailleEstimee);

    let fichierTraite = false;
    let reponseEnvoyee = false;

    const envoyerErreur = async (status: number, message: string) => {
      if (reponseEnvoyee) {
        return;
      }
      reponseEnvoyee = true;
      this.transferService.marquerEchec(transferId, message);
      await this.tempFiles.supprimerFichier(transferId);
      res.status(status).json({ ok: false, error: message, transferId });
    };

    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: this.config.maxUploadBytes, files: 1 },
    });

    busboy.on("file", (fieldname, fileStream, info) => {
      if (fieldname !== "file") {
        fileStream.resume();
        return;
      }
      if (fichierTraite) {
        fileStream.resume();
        return;
      }
      fichierTraite = true;

      const filename = info.filename || "upload.bin";
      transfer = this.transferService.obtenirTransfert(transferId) || transfer;
      transfer.originalFilename = filename;

      let nomFichierStocke = filename;
      if (nommageUpload) {
        try {
          const resolu = resoudreCheminsDepuisNommageUpload(nommageUpload, filename);
          nomFichierStocke = resolu.nomFichierStocke;
          transfer.nommageDistant = nommageUpload;
          transfer.remoteFilename = resolu.chemins.remoteFilename;
          transfer.remotePathFinal = resolu.chemins.remotePathFinal;
          transfer.remotePathPart = resolu.chemins.remotePathPart;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Nommage distant invalide.";
          fileStream.resume();
          void envoyerErreur(400, message);
          return;
        }
      }

      transfer.storedFilename = nomFichierStocke;
      this.transferService.enregistrerTransfert(transfer);

      if (!extensionAutorisee(filename)) {
        fileStream.resume();
        void envoyerErreur(400, "Extension non autorisee. Utilisez .wav ou .mp3.");
        return;
      }

      this.logger.info(
        nommageUpload
          ? `Debut upload ${transferId}: ${filename} -> ${nomFichierStocke}`
          : `Debut upload ${transferId}: ${filename}`
      );

      this.tempFiles
        .recevoirFlux({
          transferId,
          filename: nomFichierStocke,
          flux: fileStream,
          tailleTotale: tailleEstimee,
          onOctetsEcrits: (octets) => {
            this.transferService.notifierProgressionUpload(transferId, octets, tailleEstimee);
          },
        })
        .then(async ({ localPath, size }) => {
          if (reponseEnvoyee) {
            return;
          }
          try {
            this.transferService.changerEtat(transferId, TransferState.VERIFYING);
            validerFichierLocal(localPath, size);

            const courant = this.transferService.obtenirTransfert(transferId);
            if (!courant) {
              throw new Error("Transfert introuvable apres upload.");
            }
            courant.localPath = localPath;
            courant.size = size;
            courant.storedFilename = nomFichierStocke;
            this.transferService.enregistrerTransfert(courant);

            this.transferService.changerEtat(transferId, TransferState.READY);
            this.transferService.terminerProgressionUpload(transferId);
            this.transferService.notifierProgressionUpload(transferId, size, size || size);
            this.logger.info(`Upload termine ${transferId}: ${nomFichierStocke} (${size} octets)`);

            reponseEnvoyee = true;
            res.status(200).json({
              transferId,
              filename,
              storedFilename: nomFichierStocke,
              size,
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Validation echouee.";
            await envoyerErreur(500, message);
          }
        })
        .catch(async (error) => {
          const message = error instanceof Error ? error.message : "Upload echoue.";
          await envoyerErreur(500, message);
        });
    });

    busboy.on("error", (error) => {
      const message = error instanceof Error ? error.message : "Erreur multipart.";
      void envoyerErreur(400, message);
    });

    busboy.on("finish", () => {
      if (!fichierTraite && !reponseEnvoyee) {
        void envoyerErreur(400, "Aucun fichier recu (champ 'file' attendu).");
      }
    });

    req.on("aborted", () => {
      if (!reponseEnvoyee) {
        void envoyerErreur(499, "Upload interrompu par le client.");
      }
    });

    req.pipe(busboy);
  }
}
