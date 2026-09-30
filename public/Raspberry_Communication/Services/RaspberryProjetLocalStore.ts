const NOM_BASE = "wam-raspberry-session";
const NOM_STORE = "snapshot";
const CLE_SESSION = "courante";
const URL_SESSION_DISQUE = "http://127.0.0.1:5010";

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

async function sessionDisqueDisponible(): Promise<boolean> {
  try {
    const reponse = await fetch(`${URL_SESSION_DISQUE}/session/sante`);
    return reponse.ok;
  } catch {
    return false;
  }
}

async function ecrireSessionSurDisque(session: SessionProjetLocaleStockee): Promise<boolean> {
  if (!(await sessionDisqueDisponible())) {
    return false;
  }
  const nomsAudio: string[] = [];
  for (const contenu of session.contents) {
    if (!(contenu.blob instanceof Blob) || contenu.blob.size === 0) {
      continue;
    }
    const reponse = await fetch(
      `${URL_SESSION_DISQUE}/session/audio?nom=${encodeURIComponent(contenu.content_name)}`,
      {
        method: "PUT",
        headers: { "Content-Type": contenu.blob.type || "application/octet-stream" },
        body: contenu.blob,
      }
    );
    if (!reponse.ok) {
      return false;
    }
    nomsAudio.push(contenu.content_name);
  }
  const meta = await fetch(`${URL_SESSION_DISQUE}/session/meta`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project: session.project,
      regionsSons: session.regionsSons || {},
      nomsAudio,
    }),
  });
  return meta.ok;
}

async function lireSessionSurDisque(): Promise<SessionProjetLocaleStockee | null> {
  if (!(await sessionDisqueDisponible())) {
    return null;
  }
  const reponseMeta = await fetch(`${URL_SESSION_DISQUE}/session/meta`);
  if (!reponseMeta.ok) {
    return null;
  }
  const meta = (await reponseMeta.json()) as {
    project?: object;
    regionsSons?: SessionProjetLocaleStockee["regionsSons"];
    enregistreA?: number;
    nomsAudio?: string[];
  };
  if (!meta.project) {
    return null;
  }
  const contents: SessionProjetLocaleStockee["contents"] = [];
  const noms = Array.isArray(meta.nomsAudio) ? meta.nomsAudio : [];
  for (const nom of noms) {
    const reponseAudio = await fetch(
      `${URL_SESSION_DISQUE}/session/audio?nom=${encodeURIComponent(nom)}`
    );
    if (!reponseAudio.ok) {
      continue;
    }
    contents.push({ content_name: nom, blob: await reponseAudio.blob() });
  }
  return {
    project: meta.project,
    contents,
    regionsSons: meta.regionsSons,
    enregistreA: typeof meta.enregistreA === "number" ? meta.enregistreA : Date.now(),
  };
}

async function ecrireSessionIndexedDb(session: SessionProjetLocaleStockee): Promise<void> {
  const base = await ouvrirBase();
  await new Promise<void>((resolve, reject) => {
    const tx = base.transaction(NOM_STORE, "readwrite");
    tx.objectStore(NOM_STORE).put(session, CLE_SESSION);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function enregistrerSessionLocale(
  session: SessionProjetLocaleStockee
): Promise<void> {
  if (await ecrireSessionSurDisque(session)) {
    return;
  }
  await ecrireSessionIndexedDb(session);
}

/** Demarre l'ecriture tout de suite (pagehide / bouton refresh navigateur). */
export function enregistrerSessionLocaleImmediate(session: SessionProjetLocaleStockee): void {
  void enregistrerSessionLocale(session);
}

export async function lireSessionLocale(): Promise<SessionProjetLocaleStockee | null> {
  const surDisque = await lireSessionSurDisque();
  if (surDisque && compterContenusAudio(surDisque.contents) > 0) {
    return surDisque;
  }
  const base = await ouvrirBase();
  return new Promise<SessionProjetLocaleStockee | null>((resolve, reject) => {
    const tx = base.transaction(NOM_STORE, "readonly");
    const requete = tx.objectStore(NOM_STORE).get(CLE_SESSION);
    requete.onsuccess = () => resolve((requete.result as SessionProjetLocaleStockee) ?? null);
    requete.onerror = () => reject(requete.error);
  });
}

function compterContenusAudio(contents: SessionProjetLocaleStockee["contents"]): number {
  return contents.filter((contenu) => contenu.blob instanceof Blob && contenu.blob.size > 0).length;
}
