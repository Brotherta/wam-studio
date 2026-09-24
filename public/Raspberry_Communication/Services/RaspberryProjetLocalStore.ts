const NOM_BASE = "wam-raspberry-session";
const NOM_STORE = "snapshot";
const CLE_SESSION = "courante";

import type { EntreeRegionSonPersiste } from "../Services/RaspberryRegionSonStore";

export type SessionProjetLocaleStockee = {
  project: object;
  contents: { content_name: string; blob: Blob }[];
  regionsSons?: Record<string, EntreeRegionSonPersiste>;
  enregistreA: number;
};

let baseOuverte: IDBDatabase | null = null;

function ouvrirBase(): Promise<IDBDatabase> {
  if (baseOuverte) {
    return Promise.resolve(baseOuverte);
  }
  return new Promise((resolve, reject) => {
    const requete = indexedDB.open(NOM_BASE, 1);
    requete.onupgradeneeded = () => {
      const base = requete.result;
      if (!base.objectStoreNames.contains(NOM_STORE)) {
        base.createObjectStore(NOM_STORE);
      }
    };
    requete.onsuccess = () => {
      baseOuverte = requete.result;
      baseOuverte.onclose = () => {
        baseOuverte = null;
      };
      resolve(baseOuverte);
    };
    requete.onerror = () => reject(requete.error);
  });
}

export async function enregistrerSessionLocale(
  session: SessionProjetLocaleStockee
): Promise<void> {
  const base = await ouvrirBase();
  await new Promise<void>((resolve, reject) => {
    const tx = base.transaction(NOM_STORE, "readwrite");
    tx.objectStore(NOM_STORE).put(session, CLE_SESSION);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Demarre l'ecriture tout de suite (pagehide / bouton refresh navigateur). */
export function enregistrerSessionLocaleImmediate(session: SessionProjetLocaleStockee): void {
  if (!baseOuverte) {
    void enregistrerSessionLocale(session);
    return;
  }
  const tx = baseOuverte.transaction(NOM_STORE, "readwrite");
  tx.objectStore(NOM_STORE).put(session, CLE_SESSION);
}

export async function lireSessionLocale(): Promise<SessionProjetLocaleStockee | null> {
  const base = await ouvrirBase();
  return new Promise<SessionProjetLocaleStockee | null>((resolve, reject) => {
    const tx = base.transaction(NOM_STORE, "readonly");
    const requete = tx.objectStore(NOM_STORE).get(CLE_SESSION);
    requete.onsuccess = () => resolve((requete.result as SessionProjetLocaleStockee) ?? null);
    requete.onerror = () => reject(requete.error);
  });
}
