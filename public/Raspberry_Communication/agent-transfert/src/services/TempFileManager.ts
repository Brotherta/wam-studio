import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import type { Readable } from "stream";
import type { AppConfig } from "../config/AppConfig";
import type { ITempFileManager } from "../interfaces/ITempFileManager";

export class TempFileManager implements ITempFileManager {
  constructor(private readonly config: AppConfig) {
    fs.mkdirSync(this.config.tempDirectory, { recursive: true });
  }

  private repertoireTransfert(transferId: string): string {
    return path.join(this.config.tempDirectory, transferId);
  }

  public obtenirCheminLocal(transferId: string): string | undefined {
    const repertoire = this.repertoireTransfert(transferId);
    if (!fs.existsSync(repertoire)) {
      return undefined;
    }
    const fichiers = fs.readdirSync(repertoire);
    if (fichiers.length === 0) {
      return undefined;
    }
    return path.join(repertoire, fichiers[0]);
  }

  public async preparerFichier(
    transferId: string,
    filename: string
  ): Promise<{ localPath: string; stream: fs.WriteStream }> {
    const repertoire = this.repertoireTransfert(transferId);
    fs.mkdirSync(repertoire, { recursive: true });
    const nomSecurise = path.basename(filename);
    const localPath = path.join(repertoire, nomSecurise);
    const stream = fs.createWriteStream(localPath, { flags: "wx" });
    return { localPath, stream };
  }

  public async recevoirFlux(params: {
    transferId: string;
    filename: string;
    flux: Readable;
    tailleTotale?: number;
    onOctetsEcrits: (octetsEcrits: number) => void;
  }): Promise<{ localPath: string; size: number }> {
    const { localPath, stream } = await this.preparerFichier(params.transferId, params.filename);
    let octetsEcrits = 0;

    params.flux.on("data", (chunk: Buffer | string) => {
      const taille = typeof chunk === "string" ? Buffer.byteLength(chunk) : chunk.length;
      octetsEcrits += taille;
      params.onOctetsEcrits(octetsEcrits);
    });

    try {
      await pipeline(params.flux, stream);
    } catch (error) {
      await this.supprimerFichier(params.transferId);
      throw error;
    }

    const stat = fs.statSync(localPath);
    return { localPath, size: stat.size };
  }

  public async finaliserFichier(_transferId: string): Promise<void> {
    return Promise.resolve();
  }

  public async supprimerFichier(transferId: string): Promise<void> {
    const repertoire = this.repertoireTransfert(transferId);
    if (fs.existsSync(repertoire)) {
      fs.rmSync(repertoire, { recursive: true, force: true });
    }
  }
}
