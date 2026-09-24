import type { Writable } from "stream";

export type ProgressionEcriture = {
  bytesEcrits: number;
};

export type ResultatReceptionFlux = {
  localPath: string;
  size: number;
};

export interface ITempFileManager {
  preparerFichier(transferId: string, filename: string): Promise<{ localPath: string; stream: Writable }>;
  recevoirFlux(params: {
    transferId: string;
    filename: string;
    flux: NodeJS.ReadableStream;
    tailleTotale?: number;
    onOctetsEcrits: (octetsEcrits: number) => void;
  }): Promise<ResultatReceptionFlux>;
  finaliserFichier(transferId: string): Promise<void>;
  supprimerFichier(transferId: string): Promise<void>;
  obtenirCheminLocal(transferId: string): string | undefined;
}
