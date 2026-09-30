import type winston from "winston";
import type { IAuthenticationProvider } from "../interfaces/IAuthenticationProvider";
import type { IScpClient, OptionsUploadAtomique } from "../interfaces/IScpClient";
import { formaterErreurSsh } from "../utils/erreurSsh";
import {
  creerRepertoireRecursif,
  envoyerFichierAvecProgression,
  finaliserUploadAtomiqueDistant,
  obtenirSftp,
  supprimerSiExiste,
} from "./SftpHelpers";

export class Ssh2ScpClient implements IScpClient {
  constructor(
    private readonly auth: IAuthenticationProvider,
    private readonly logger: winston.Logger
  ) {}

  public async uploadFichierAtomique(params: OptionsUploadAtomique): Promise<void> {
    const client = await this.auth.connect();
    params.onConnexion?.(() => client.end());

    const onAbort = () => {
      this.logger.warn("Connexion SSH interrompue (annulation).");
      client.end();
    };
    params.signal?.addEventListener("abort", onAbort);

    let sftp: Awaited<ReturnType<typeof obtenirSftp>> | undefined;
    const contexteErreur = {
      cheminDistant: params.remotePathFinal,
      dossierDistant: params.remoteDirectory,
    };

    const executerEtape = async <T>(
      operation: string,
      action: () => Promise<T>,
      contexteEtape?: Partial<typeof contexteErreur>
    ): Promise<T> => {
      try {
        return await action();
      } catch (error) {
        throw formaterErreurSsh(error, { operation, ...contexteErreur, ...contexteEtape });
      }
    };

    try {
      if (params.signal?.aborted) {
        throw new Error("Transfert SCP annule.");
      }

      const sessionSftp = await executerEtape("ouverture session SFTP", () => obtenirSftp(client));
      sftp = sessionSftp;
      await executerEtape(
        "creation du dossier distant",
        () => creerRepertoireRecursif(sessionSftp, params.remoteDirectory),
        { cheminDistant: undefined }
      );
      await executerEtape("preparation fichier temporaire distant", () =>
        supprimerSiExiste(sessionSftp, params.remotePathPart)
      );

      this.logger.info(`Upload SFTP vers ${params.remotePathPart}`);
      await executerEtape("envoi du fichier", () =>
        envoyerFichierAvecProgression({
          sftp: sessionSftp,
          cheminLocal: params.localPath,
          cheminDistant: params.remotePathPart,
          tailleTotale: params.tailleTotale,
          signal: params.signal,
          onProgress: (courant, total) => params.onProgress({ current: courant, total }),
        })
      );

      if (params.signal?.aborted) {
        throw new Error("Transfert SCP annule.");
      }

      await executerEtape("finalisation du fichier distant", () =>
        finaliserUploadAtomiqueDistant(sessionSftp, params.remotePathPart, params.remotePathFinal)
      );
      this.logger.info(`Renommage atomique: ${params.remotePathFinal}`);
    } catch (error) {
      if (sftp) {
        await supprimerSiExiste(sftp, params.remotePathPart);
      }
      throw error;
    } finally {
      params.signal?.removeEventListener("abort", onAbort);
      client.end();
    }
  }
}
