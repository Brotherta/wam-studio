import type winston from "winston";
import {
  construireCheminDistantFinal,
  REMOTE_SONS_DIRECTORY,
} from "../config/RemotePathConvention";
import { formaterErreurSsh } from "../utils/erreurSsh";
import {
  estNomFichierAudioAutorise,
  filtrerNomsFichiersAudioAutorises,
} from "../utils/validerNomFichierAudio";
import {
  listerFichiersAudio,
  lireFichierDistant,
  obtenirSftp,
  supprimerSiExiste,
} from "../scp/SftpHelpers";
import { creerFournisseurAuthentification } from "../auth/AuthenticationProvider";

export type RequeteListeFichiers = {
  sshHost: string;
  sshPort?: number;
  sshUsername?: string;
  sshPassword?: string;
};

export type RequeteSuppressionFichiers = RequeteListeFichiers & {
  fichiers: string[];
};

export type RequeteTelechargementFichier = RequeteListeFichiers & {
  fichier: string;
};

export type ResultatListeFichiers = {
  ok: true;
  fichiers: string[];
  remoteDirectory: string;
};

export type ResultatSuppressionFichiers = {
  ok: true;
  supprimes: string[];
  ignores: string[];
  remoteDirectory: string;
};

export type ResultatTelechargementFichier = {
  ok: true;
  nomFichier: string;
  contenu: Buffer;
  remoteDirectory: string;
};

export class RemoteFilesService {
  constructor(private readonly logger: winston.Logger) {}

  public async listerFichiersAudio(requete: RequeteListeFichiers): Promise<ResultatListeFichiers> {
    const remoteDirectory = REMOTE_SONS_DIRECTORY;
    const authProvider = creerFournisseurAuthentification("password", {
      host: requete.sshHost,
      port: requete.sshPort ?? 22,
      username: requete.sshUsername ?? "pi",
      password: requete.sshPassword ?? "raspberry",
    });

    const client = await authProvider.connect();
    try {
      const sftp = await obtenirSftp(client);
      const fichiers = await listerFichiersAudio(sftp, remoteDirectory);
      this.logger.info(
        `Liste ${fichiers.length} fichier(s) audio sur ${requete.sshHost}:${remoteDirectory}`
      );
      return { ok: true, fichiers, remoteDirectory };
    } catch (error) {
      throw formaterErreurSsh(error, {
        operation: "liste des fichiers audio",
        dossierDistant: remoteDirectory,
      });
    } finally {
      client.end();
    }
  }

  public async telechargerFichierAudio(
    requete: RequeteTelechargementFichier
  ): Promise<ResultatTelechargementFichier> {
    const remoteDirectory = REMOTE_SONS_DIRECTORY;
    const nomBrut = `${requete.fichier ?? ""}`.trim();
    if (!estNomFichierAudioAutorise(nomBrut)) {
      throw new Error("Nom de fichier audio invalide.");
    }
    const nomFichier = nomBrut;

    const authProvider = creerFournisseurAuthentification("password", {
      host: requete.sshHost,
      port: requete.sshPort ?? 22,
      username: requete.sshUsername ?? "pi",
      password: requete.sshPassword ?? "raspberry",
    });

    const client = await authProvider.connect();
    try {
      const sftp = await obtenirSftp(client);
      const presents = new Set(await listerFichiersAudio(sftp, remoteDirectory));
      if (!presents.has(nomFichier)) {
        throw new Error(`Fichier introuvable sur le Pi : ${nomFichier}`);
      }
      const chemin = construireCheminDistantFinal(nomFichier);
      const contenu = await lireFichierDistant(sftp, chemin);
      this.logger.info(
        `Telechargement ${nomFichier} (${contenu.length} octets) depuis ${requete.sshHost}`
      );
      return { ok: true, nomFichier, contenu, remoteDirectory };
    } catch (error) {
      throw formaterErreurSsh(error, {
        operation: "telechargement de fichier audio",
        dossierDistant: remoteDirectory,
      });
    } finally {
      client.end();
    }
  }

  public async supprimerFichiersAudio(
    requete: RequeteSuppressionFichiers
  ): Promise<ResultatSuppressionFichiers> {
    const remoteDirectory = REMOTE_SONS_DIRECTORY;
    const demandes = filtrerNomsFichiersAudioAutorises(requete.fichiers);
    if (demandes.length === 0) {
      throw new Error("Aucun nom de fichier audio valide a supprimer.");
    }

    const authProvider = creerFournisseurAuthentification("password", {
      host: requete.sshHost,
      port: requete.sshPort ?? 22,
      username: requete.sshUsername ?? "pi",
      password: requete.sshPassword ?? "raspberry",
    });

    const client = await authProvider.connect();
    try {
      const sftp = await obtenirSftp(client);
      const presents = new Set(await listerFichiersAudio(sftp, remoteDirectory));
      const supprimes: string[] = [];
      const ignores: string[] = [];

      for (const nom of demandes) {
        if (!presents.has(nom)) {
          ignores.push(nom);
          continue;
        }
        const chemin = construireCheminDistantFinal(nom);
        if (!chemin.startsWith(`${remoteDirectory}/`)) {
          ignores.push(nom);
          continue;
        }
        await supprimerSiExiste(sftp, chemin);
        const cheminPart = `${chemin}.part`;
        await supprimerSiExiste(sftp, cheminPart);
        supprimes.push(nom);
      }

      this.logger.info(
        `Suppression ${supprimes.length} fichier(s) audio sur ${requete.sshHost}:${remoteDirectory}`
      );
      return { ok: true, supprimes, ignores, remoteDirectory };
    } catch (error) {
      throw formaterErreurSsh(error, {
        operation: "suppression de fichiers audio",
        dossierDistant: remoteDirectory,
      });
    } finally {
      client.end();
    }
  }
}
