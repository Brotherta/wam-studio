const EXTENSIONS_FICHIER_AUDIO = /\.(wav|mp3|aiff|aif|flac|ogg)$/i;

/** Verifie qu'un nom de fichier audio est sur et ne contient pas de chemin. */
export function estNomFichierAudioAutorise(nomFichier: string): boolean {
  const nom = nomFichier.trim();
  if (!nom || nom.startsWith(".") || nom.includes("/") || nom.includes("\\") || nom.includes("..")) {
    return false;
  }
  if (nom.endsWith(".part")) {
    return false;
  }
  return EXTENSIONS_FICHIER_AUDIO.test(nom);
}

export function filtrerNomsFichiersAudioAutorises(noms: string[]): string[] {
  const uniques = new Set<string>();
  for (const brut of noms) {
    if (estNomFichierAudioAutorise(brut)) {
      uniques.add(brut.trim());
    }
  }
  return [...uniques];
}
