const PREFIXE = "wam-libelles-sons:";

function clePourIp(ip: string): string {
  return `${PREFIXE}${ip}`;
}

function nomFichierCle(nom: string): string {
  const brut = nom.replace(/\\/g, "/").trim();
  const segments = brut.split("/");
  return segments[segments.length - 1] || brut;
}

function lireStockage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function lireLibellesSons(ip: string): Record<string, string> {
  const stockage = lireStockage();
  if (!stockage) {
    return {};
  }
  try {
    const brut = stockage.getItem(clePourIp(ip));
    if (!brut) {
      return {};
    }
    const parse = JSON.parse(brut) as Record<string, string>;
    if (!parse || typeof parse !== "object") {
      return {};
    }
    const resultat: Record<string, string> = {};
    for (const [nom, libelle] of Object.entries(parse)) {
      if (typeof libelle === "string" && libelle.trim()) {
        resultat[nomFichierCle(nom)] = libelle.trim();
      }
    }
    return resultat;
  } catch {
    return {};
  }
}

export function ecrireLibellesSons(ip: string, libelles: Record<string, string>): void {
  const stockage = lireStockage();
  if (!stockage) {
    return;
  }
  stockage.setItem(clePourIp(ip), JSON.stringify(libelles));
}

export function lireLibelleSon(ip: string, nomFichier: string): string | undefined {
  const nom = nomFichierCle(nomFichier);
  if (!nom) {
    return undefined;
  }
  return lireLibellesSons(ip)[nom];
}

export function enregistrerLibelleSon(ip: string, nomFichier: string, libelle: string): void {
  const propre = libelle.trim();
  const nom = nomFichierCle(nomFichier);
  if (!nom || !propre) {
    return;
  }
  const libelles = lireLibellesSons(ip);
  libelles[nom] = propre;
  ecrireLibellesSons(ip, libelles);
}

/**
 * Libelles a afficher pour la liste de fichiers actuelle.
 * Ne supprime rien en memoire : une liste incomplete (cache Play, listing pendant l'envoi)
 * effacait les noms du 2e Send Audio.
 */
export function synchroniserLibellesDepuisFichiers(
  ip: string,
  fichiers: string[]
): Record<string, string> {
  const connus = new Set(fichiers.map(nomFichierCle));
  const visibles: Record<string, string> = {};
  for (const [nom, libelle] of Object.entries(lireLibellesSons(ip))) {
    if (connus.has(nomFichierCle(nom))) {
      visibles[nom] = libelle;
    }
  }
  return visibles;
}

export function retirerLibellesSons(ip: string, nomsFichiers: string[]): void {
  if (nomsFichiers.length === 0) {
    return;
  }
  const aRetirer = new Set(nomsFichiers.map(nomFichierCle));
  const libelles = lireLibellesSons(ip);
  let modifie = false;
  for (const nom of Object.keys(libelles)) {
    if (aRetirer.has(nomFichierCle(nom))) {
      delete libelles[nom];
      modifie = true;
    }
  }
  if (modifie) {
    ecrireLibellesSons(ip, libelles);
  }
}
