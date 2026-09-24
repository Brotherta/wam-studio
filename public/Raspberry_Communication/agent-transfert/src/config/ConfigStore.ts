import fs from "fs";
import path from "path";

/** Parametres SSH memorisables localement (jamais mot de passe / passphrase). */
export type ConfigPersistee = {
  sshHost?: string;
  sshPort?: number;
  sshLogin?: string;
  privateKeyPath?: string;
  lastLocalFolder?: string;
};

const NOM_FICHIER = "config.local.json";

export class ConfigStore {
  private readonly filePath: string;

  constructor(racineProjet: string) {
    this.filePath = path.join(racineProjet, NOM_FICHIER);
  }

  public lire(): ConfigPersistee {
    if (!fs.existsSync(this.filePath)) {
      return {};
    }
    try {
      const contenu = fs.readFileSync(this.filePath, "utf8");
      return JSON.parse(contenu) as ConfigPersistee;
    } catch {
      return {};
    }
  }

  public ecrire(partiel: ConfigPersistee): ConfigPersistee {
    const fusion = { ...this.lire(), ...partiel };
    fs.writeFileSync(this.filePath, `${JSON.stringify(fusion, null, 2)}\n`, "utf8");
    return fusion;
  }
}
