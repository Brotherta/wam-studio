import fs from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";
import { afterEach, describe, expect, it } from "vitest";
import { creerConfigurationParDefaut } from "../src/config/AppConfig";
import { TempFileManager } from "../src/services/TempFileManager";

describe("TempFileManager", () => {
  const repertoires = new Set<string>();

  afterEach(() => {
    repertoires.forEach((rep) => {
      if (fs.existsSync(rep)) {
        fs.rmSync(rep, { recursive: true, force: true });
      }
    });
    repertoires.clear();
  });

  function creerGestionnaire(): TempFileManager {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agent-transfert-test-"));
    repertoires.add(tempRoot);
    const config = creerConfigurationParDefaut();
    config.tempDirectory = tempRoot;
    return new TempFileManager(config);
  }

  it("ecrit un flux dans le repertoire temporaire", async () => {
    const manager = creerGestionnaire();
    const contenu = Buffer.from("test-audio-wav");
    const flux = Readable.from([contenu]);
    const progression: number[] = [];

    const resultat = await manager.recevoirFlux({
      transferId: "test-uuid",
      filename: "son.wav",
      flux,
      tailleTotale: contenu.length,
      onOctetsEcrits: (octets) => progression.push(octets),
    });

    expect(resultat.size).toBe(contenu.length);
    expect(fs.existsSync(resultat.localPath)).toBe(true);
    expect(fs.readFileSync(resultat.localPath).equals(contenu)).toBe(true);
    expect(progression.at(-1)).toBe(contenu.length);
  });

  it("supprime le repertoire du transfert", async () => {
    const manager = creerGestionnaire();
    const flux = Readable.from([Buffer.from("x")]);
    await manager.recevoirFlux({
      transferId: "a-supprimer",
      filename: "a.wav",
      flux,
      onOctetsEcrits: () => undefined,
    });
    await manager.supprimerFichier("a-supprimer");
    expect(manager.obtenirCheminLocal("a-supprimer")).toBeUndefined();
  });
});
