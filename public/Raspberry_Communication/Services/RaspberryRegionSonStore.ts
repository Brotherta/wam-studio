const CLE = "wam-regions-sons";
const TOLERANCE_START_MS = 120;
const TOLERANCE_DUREE_MS = 250;

export type EntreeRegionSon = {
  trackId?: number;
  regionId?: number;
  raspberryId: number;
  startMs: number;
  durationMs: number;
  sonNumber: number | null;
  nomFichier: string;
  nomAffiche: string;
  indexOrdre?: number;
};

/** Metadonnees stables sauvegardees avec la session (cle = content_name region). */
export type EntreeRegionSonPersiste = Omit<EntreeRegionSon, "trackId" | "regionId">;

function lireStockage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function lireToutes(): EntreeRegionSon[] {
  const stockage = lireStockage();
  if (!stockage) {
    return [];
  }
  try {
    const brut = stockage.getItem(CLE);
    if (!brut) {
      return [];
    }
    const parse = JSON.parse(brut) as EntreeRegionSon[];
    return Array.isArray(parse) ? parse.filter(estEntreeValide).map(normaliserEntree) : [];
  } catch {
    return [];
  }
}

function normaliserEntree(entree: EntreeRegionSon): EntreeRegionSon {
  const sansExtension =
    entree.nomFichier.replace(/\.[^.]+$/, "").trim() || entree.nomFichier.trim();
  return {
    ...entree,
    nomAffiche:
      entree.nomAffiche?.trim() ||
      sansExtension ||
      (entree.sonNumber !== null ? `son${entree.sonNumber}` : "son ?"),
  };
}

function estEntreeValide(item: unknown): item is EntreeRegionSon {
  if (!item || typeof item !== "object") {
    return false;
  }
  const entree = item as EntreeRegionSon;
  return (
    Number.isFinite(entree.raspberryId) &&
    Number.isFinite(entree.startMs) &&
    Number.isFinite(entree.durationMs) &&
    (entree.sonNumber === null || Number.isFinite(entree.sonNumber)) &&
    typeof entree.nomFichier === "string"
  );
}

function ecrireToutes(entrees: EntreeRegionSon[]): void {
  const stockage = lireStockage();
  if (!stockage) {
    return;
  }
  stockage.setItem(CLE, JSON.stringify(entrees));
}

function positionsProches(a: EntreeRegionSon, startMs: number, durationMs?: number): boolean {
  if (Math.abs(a.startMs - startMs) > TOLERANCE_START_MS) {
    return false;
  }
  if (durationMs === undefined) {
    return true;
  }
  return Math.abs(a.durationMs - durationMs) <= TOLERANCE_DUREE_MS;
}

function memeRegion(a: EntreeRegionSon, b: EntreeRegionSon): boolean {
  if (
    a.trackId !== undefined &&
    a.regionId !== undefined &&
    b.trackId !== undefined &&
    b.regionId !== undefined &&
    a.trackId === b.trackId &&
    a.regionId === b.regionId
  ) {
    return true;
  }
  if (
    a.raspberryId === b.raspberryId &&
    a.indexOrdre !== undefined &&
    b.indexOrdre !== undefined &&
    a.indexOrdre === b.indexOrdre
  ) {
    return true;
  }
  return (
    a.raspberryId === b.raspberryId &&
    positionsProches(a, b.startMs, b.durationMs)
  );
}

export function enregistrerRegionSon(entree: EntreeRegionSon): void {
  const normalise = normaliserEntree(entree);
  const autres = lireToutes().filter((item) => !memeRegion(item, normalise));
  autres.push(normalise);
  ecrireToutes(autres);
}

export function importerRegionsSonsPersistes(
  regionsSons: Record<string, EntreeRegionSonPersiste> | undefined
): void {
  if (!regionsSons) {
    return;
  }
  for (const entree of Object.values(regionsSons)) {
    if (!estEntreeValide(entree as EntreeRegionSon)) {
      continue;
    }
    enregistrerRegionSon(entree as EntreeRegionSon);
  }
}

export function trouverSonPourRegion(
  raspberryId: number,
  startMs: number,
  regionId?: number,
  trackId?: number,
  durationMs?: number,
  indexOrdre?: number
): EntreeRegionSon | undefined {
  const toutes = lireToutes();

  if (trackId !== undefined && regionId !== undefined) {
    const parId = toutes.find(
      (item) => item.trackId === trackId && item.regionId === regionId
    );
    if (parId) {
      return parId;
    }
  }

  if (indexOrdre !== undefined) {
    const parOrdre = toutes.find(
      (item) => item.raspberryId === raspberryId && item.indexOrdre === indexOrdre
    );
    if (parOrdre) {
      return parOrdre;
    }
  }

  if (durationMs !== undefined) {
    const parPosition = toutes.find(
      (item) =>
        item.raspberryId === raspberryId &&
        positionsProches(item, startMs, durationMs)
    );
    if (parPosition) {
      return parPosition;
    }
  }

  return toutes.find(
    (item) => item.raspberryId === raspberryId && positionsProches(item, startMs)
  );
}

export function listerSonsPourRaspberry(raspberryId: number): EntreeRegionSon[] {
  return lireToutes()
    .filter((item) => item.raspberryId === raspberryId)
    .sort((a, b) => a.startMs - b.startMs);
}

export function listerToutesEntreesRegionSon(): EntreeRegionSon[] {
  return lireToutes();
}
