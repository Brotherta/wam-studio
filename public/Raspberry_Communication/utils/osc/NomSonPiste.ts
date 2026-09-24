/** Nom technique Skini (ex. son520), d'apres le fichier ou le numero. */
function nomTechniqueSon(nomFichier: string, sonNumber?: number | null): string {
  const nomCourt = nomFichier.replace(/\\/g, "/").split("/").pop() || nomFichier;
  const sansExtension = nomCourt.replace(/\.[^.]+$/, "").trim();
  if (sansExtension) {
    return sansExtension;
  }
  if (sonNumber != null && Number.isFinite(sonNumber)) {
    return `son${sonNumber}`;
  }
  return "";
}

function lireNomPersonnalise(
  brut: string | undefined,
  nomTechnique: string
): string | undefined {
  const texte = brut?.trim();
  if (!texte || texte === "son ?") {
    return undefined;
  }
  if (nomTechnique && texte === nomTechnique) {
    return undefined;
  }
  const prefixe = nomTechnique ? `${nomTechnique} (` : "";
  if (prefixe && texte.startsWith(prefixe) && texte.endsWith(")")) {
    const interieur = texte.slice(prefixe.length, -1).trim();
    return interieur && interieur !== nomTechnique ? interieur : undefined;
  }
  return texte;
}

/**
 * Nom affiche sur la piste et dans le sequenceur.
 * Avec un nom choisi : "son520 (test11)". Sans : "son520".
 */
export function formaterNomAfficheSon(
  nomFichier: string,
  options?: { libelle?: string; sonNumber?: number | null }
): string {
  const technique = nomTechniqueSon(nomFichier, options?.sonNumber);
  const personnalise = lireNomPersonnalise(options?.libelle, technique);
  if (technique && personnalise) {
    return `${technique} (${personnalise})`;
  }
  if (technique) {
    return technique;
  }
  if (personnalise) {
    return personnalise;
  }
  return "son ?";
}
