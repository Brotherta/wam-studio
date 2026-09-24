import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import type { Client } from "ssh2";

export type ClientSftp = {
  mkdir: (chemin: string, callback: (err: Error | null) => void) => void;
  unlink: (chemin: string, callback: (err: Error | null) => void) => void;
  rename: (source: string, destination: string, callback: (err: Error | null) => void) => void;
  stat: (
    chemin: string,
    callback: (err: Error | null, stats?: unknown) => void
  ) => void;
  readdir: (
    chemin: string,
    callback: (
      err: Error | null,
      list?: Array<{ filename?: string; attrs?: unknown }>
    ) => void
  ) => void;
  rmdir: (chemin: string, callback: (err: Error | null) => void) => void;
  fastPut: (
    cheminLocal: string,
    cheminDistant: string,
    options: { step?: (transferred: number, chunk: number, total: number) => void },
    callback: (err: Error | null) => void
  ) => void;
  fastGet: (
    cheminDistant: string,
    cheminLocal: string,
    options: Record<string, unknown>,
    callback: (err: Error | null) => void
  ) => void;
};

export function promesseSftp<T>(
  operation: (callback: (err: Error | null, result?: T) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    operation((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result as T);
    });
  });
}

export async function obtenirSftp(client: Client): Promise<ClientSftp> {
  return new Promise((resolve, reject) => {
    client.sftp((err, sftp) => {
      if (err || !sftp) {
        reject(err ?? new Error("Session SFTP indisponible."));
        return;
      }
      resolve(sftp as unknown as ClientSftp);
    });
  });
}

function repertoireExisteDeja(error: unknown): boolean {
  const errObj = error as Error & { code?: string | number };
  return errObj.code === "EEXIST" || errObj.code === 4;
}

export async function creerRepertoireRecursif(sftp: ClientSftp, chemin: string): Promise<void> {
  const segments = chemin.split("/").filter(Boolean);
  let courant = chemin.startsWith("/") ? "" : "";
  for (const segment of segments) {
    courant += `/${segment}`;
    try {
      await promesseSftp((callback) => sftp.mkdir(courant, callback));
    } catch (error) {
      if (!repertoireExisteDeja(error)) {
        throw error;
      }
    }
  }
}

function fichierAbsent(error: unknown): boolean {
  const errObj = error as Error & { code?: string | number };
  return errObj.code === 2 || errObj.code === "ENOENT";
}

export async function supprimerSiExiste(sftp: ClientSftp, chemin: string): Promise<void> {
  try {
    await promesseSftp((callback) => sftp.unlink(chemin, callback));
  } catch (error) {
    if (!fichierAbsent(error)) {
      throw error;
    }
  }
}

function estDossier(attrs: unknown): boolean {
  const anyAttrs = attrs as { isDirectory?: () => boolean } | undefined;
  if (!anyAttrs) return false;
  if (typeof anyAttrs.isDirectory === "function") {
    return anyAttrs.isDirectory();
  }
  // Fallback : certains bind exposent `isDirectory` via une propriete bool.
  if (typeof (anyAttrs as any).isDirectory === "boolean") {
    return Boolean((anyAttrs as any).isDirectory);
  }
  return false;
}

/** Vide recursivement un repertoire distant (sans supprimer le repertoire lui-meme). */
export async function viderRepertoireRecursif(sftp: ClientSftp, chemin: string): Promise<void> {
  let entries: Array<{ filename?: string; attrs?: unknown }> = [];
  try {
    entries = await promesseSftp((callback) => sftp.readdir(chemin, callback));
  } catch (error) {
    if (fichierAbsent(error)) {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    const nom = entry.filename;
    if (!nom || nom === "." || nom === "..") continue;
    const cheminElement = `${chemin}/${nom}`;

    if (estDossier(entry.attrs)) {
      await viderRepertoireRecursif(sftp, cheminElement);
      await promesseSftp((callback) => sftp.rmdir(cheminElement, callback));
    } else {
      await supprimerSiExiste(sftp, cheminElement);
    }
  }
}

const EXTENSIONS_FICHIER_AUDIO = /\.(wav|mp3|aiff|aif|flac|ogg)$/i;

/** Liste les fichiers audio d'un dossier distant (sans parcourir les sous-dossiers). */
export async function listerFichiersAudio(sftp: ClientSftp, chemin: string): Promise<string[]> {
  let entries: Array<{ filename?: string; attrs?: unknown }> = [];
  try {
    entries = await promesseSftp((callback) => sftp.readdir(chemin, callback));
  } catch (error) {
    if (fichierAbsent(error)) {
      return [];
    }
    throw error;
  }

  return entries
    .map((entry) => entry.filename)
    .filter((nom): nom is string => !!nom && nom !== "." && nom !== "..")
    .filter((nom) => !estDossier(entries.find((entry) => entry.filename === nom)?.attrs))
    .filter((nom) => EXTENSIONS_FICHIER_AUDIO.test(nom))
    .filter((nom) => !nom.endsWith(".part"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

/** Remplace le fichier final par le .part (supprime l'ancien si present). */
export async function finaliserUploadAtomiqueDistant(
  sftp: ClientSftp,
  cheminPart: string,
  cheminFinal: string
): Promise<void> {
  await supprimerSiExiste(sftp, cheminFinal);
  await renommerFichierDistant(sftp, cheminPart, cheminFinal);
}

export async function renommerFichierDistant(
  sftp: ClientSftp,
  source: string,
  destination: string
): Promise<void> {
  await promesseSftp((callback) => sftp.rename(source, destination, callback));
}

/** Lit un fichier distant en memoire (telechargement Pi → agent). */
export async function lireFichierDistant(sftp: ClientSftp, chemin: string): Promise<Buffer> {
  const temporaire = path.join(os.tmpdir(), `wam-import-${randomUUID()}`);
  try {
    await promesseSftp((callback) => sftp.fastGet(chemin, temporaire, {}, callback));
    const contenu = fs.readFileSync(temporaire);
    if (contenu.length === 0) {
      throw new Error(`Fichier distant vide : ${chemin}`);
    }
    return contenu;
  } finally {
    try {
      fs.unlinkSync(temporaire);
    } catch {
      // ignore
    }
  }
}

export async function envoyerFichierAvecProgression(params: {
  sftp: ClientSftp;
  cheminLocal: string;
  cheminDistant: string;
  tailleTotale: number;
  signal?: AbortSignal;
  onProgress: (octets: number, total: number) => void;
}): Promise<void> {
  const { sftp, cheminLocal, cheminDistant, tailleTotale, signal, onProgress } = params;
  const total = tailleTotale > 0 ? tailleTotale : 1;

  await promesseSftp((callback) => {
    sftp.fastPut(
      cheminLocal,
      cheminDistant,
      {
        step: (transferred: number) => {
          onProgress(Math.min(transferred, total), total);
        },
      },
      (err: Error | null) => {
        if (signal?.aborted) {
          callback(new Error("Transfert SCP annule."));
          return;
        }
        callback(err);
      }
    );
  });
}
