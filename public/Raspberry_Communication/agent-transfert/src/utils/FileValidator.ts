import fs from "fs";

const EXTENSIONS_AUDIO_AUTORISEES = new Set([".wav", ".mp3"]);

export function extensionAutorisee(filename: string): boolean {
  const point = filename.lastIndexOf(".");
  if (point < 0) {
    return false;
  }
  return EXTENSIONS_AUDIO_AUTORISEES.has(filename.slice(point).toLowerCase());
}

export function validerFichierLocal(chemin: string, tailleAttendue: number): void {
  if (!fs.existsSync(chemin)) {
    throw new Error("Fichier temporaire introuvable apres upload.");
  }
  const stat = fs.statSync(chemin);
  if (!stat.isFile()) {
    throw new Error("Le chemin temporaire n'est pas un fichier.");
  }
  if (stat.size !== tailleAttendue) {
    throw new Error(`Taille invalide: attendu ${tailleAttendue}, recu ${stat.size}.`);
  }
}
