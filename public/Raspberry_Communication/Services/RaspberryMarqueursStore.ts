import type { MarqueurSequenceur, TypeMarqueurSequenceur } from "../Models/MarqueurSequenceur";

const CLE_STOCKAGE = "wam-marqueurs-sequenceur";

function lireStockage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function estTypeMarqueur(valeur: unknown): valeur is TypeMarqueurSequenceur {
  return valeur === "osc" || valeur === "cue";
}

function lireMarqueurBrut(valeur: unknown): MarqueurSequenceur | null {
  if (!valeur || typeof valeur !== "object") {
    return null;
  }
  const item = valeur as Record<string, unknown>;
  if (typeof item.id !== "string" || !item.id.trim()) {
    return null;
  }
  if (!estTypeMarqueur(item.type)) {
    return null;
  }
  const tempsMs = typeof item.tempsMs === "number" ? item.tempsMs : Number(item.tempsMs);
  if (!Number.isFinite(tempsMs) || tempsMs < 0) {
    return null;
  }
  return {
    id: item.id.trim(),
    type: item.type,
    tempsMs,
    libelle: typeof item.libelle === "string" ? item.libelle.trim() : "",
    oscAdresse: typeof item.oscAdresse === "string" ? item.oscAdresse.trim() : "",
    oscValeur: typeof item.oscValeur === "string" ? item.oscValeur.trim() : "",
  };
}

export function lireMarqueursSequenceur(): MarqueurSequenceur[] {
  const stockage = lireStockage();
  if (!stockage) {
    return [];
  }
  try {
    const brut = stockage.getItem(CLE_STOCKAGE);
    if (!brut) {
      return [];
    }
    const parse = JSON.parse(brut) as unknown;
    if (!Array.isArray(parse)) {
      return [];
    }
    return parse
      .map(lireMarqueurBrut)
      .filter((item): item is MarqueurSequenceur => item !== null)
      .sort((a, b) => a.tempsMs - b.tempsMs);
  } catch {
    return [];
  }
}

export function ecrireMarqueursSequenceur(marqueurs: MarqueurSequenceur[]): void {
  const stockage = lireStockage();
  if (!stockage) {
    return;
  }
  stockage.setItem(CLE_STOCKAGE, JSON.stringify(marqueurs));
  try {
    window.dispatchEvent(new Event("raspberry-marqueurs-change"));
  } catch {
    return;
  }
}

export function creerIdMarqueur(): string {
  return `marqueur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ajouterMarqueurSequenceur(marqueur: MarqueurSequenceur): void {
  const liste = lireMarqueursSequenceur().filter((item) => item.id !== marqueur.id);
  liste.push(marqueur);
  liste.sort((a, b) => a.tempsMs - b.tempsMs);
  ecrireMarqueursSequenceur(liste);
}

export function trouverMarqueurParId(id: string): MarqueurSequenceur | undefined {
  return lireMarqueursSequenceur().find((item) => item.id === id);
}

export function mettreAJourMarqueurSequenceur(
  id: string,
  champs: Partial<Omit<MarqueurSequenceur, "id">>
): void {
  const liste = lireMarqueursSequenceur().map((item) =>
    item.id === id ? { ...item, ...champs, id: item.id } : item
  );
  liste.sort((a, b) => a.tempsMs - b.tempsMs);
  ecrireMarqueursSequenceur(liste);
}

export function supprimerMarqueurSequenceur(id: string): void {
  ecrireMarqueursSequenceur(lireMarqueursSequenceur().filter((item) => item.id !== id));
}
