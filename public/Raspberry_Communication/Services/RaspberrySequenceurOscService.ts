import type { IWamPistesPont, RegionPisteRaspberry } from "../Interfaces/IWamPistesPont";
import type Raspberry from "../Models/Raspberry";
import { extraireNumeroRaspberryDepuisIp } from "../utils/agent-transfert/AgentTransfertHelpers";
import { raspberryTrackBindingStore } from "./RaspberryTrackBindingStore";
import {
  extraireNumeroSonOscDepuisFichier,
  lireNiveauPlay,
  OSC_PLAY_NIVEAU_DEFAUT,
} from "../utils/osc/OscPlayHelpers";
import { formaterTempsPiste } from "../utils/osc/FormatTempsPiste";

export type EvenementSequenceurOsc = {
  kind?: "play" | "osc" | "cue";
  idMarqueur?: string;
  oscAdresse?: string;
  oscValeur?: string;
  raspberryId: number;
  nomPiste: string;
  ip: string | null;
  startMs: number;
  endMs: number;
  sonNumber: number | null;
  nomFichier: string;
  nomAffiche: string;
  niveau: number;
  commandeOsc: string;
};

/** Construit /play {numero} {niveau} avec bornes 0–127. */
export function construireCommandePlayOsc(
  sonNumber: number | null,
  niveau: number
): string {
  if (sonNumber === null || !Number.isFinite(sonNumber)) {
    return "";
  }
  const propre = lireNiveauPlay(String(niveau));
  return `/play ${sonNumber} ${propre}`;
}

export function actualiserCommandeOscEvenement(evenement: EvenementSequenceurOsc): void {
  evenement.niveau = lireNiveauPlay(String(evenement.niveau));
  evenement.commandeOsc = construireCommandePlayOsc(evenement.sonNumber, evenement.niveau);
}

/** Identifie le contenu des pistes, sans le niveau (reglable dans la fenetre). */
export function signatureProgrammeSequenceur(programme: EvenementSequenceurOsc[]): string {
  return programme
    .map(
      (evenement) =>
        `${evenement.kind ?? "play"}|${evenement.idMarqueur ?? ""}|${evenement.raspberryId}|${evenement.startMs}|${evenement.endMs}|${evenement.sonNumber ?? ""}|${evenement.nomAffiche}|${evenement.nomFichier}|${evenement.commandeOsc}`
    )
    .join("\n");
}

/** Garde les niveaux saisis quand la timeline se met a jour toute seule. */
export function reporterNiveauxProgramme(
  source: EvenementSequenceurOsc[],
  cible: EvenementSequenceurOsc[]
): void {
  for (const suivant of cible) {
    const precedent = source.find(
      (item) =>
        item.raspberryId === suivant.raspberryId &&
        item.startMs === suivant.startMs &&
        item.sonNumber === suivant.sonNumber
    );
    if (!precedent) {
      continue;
    }
    suivant.niveau = precedent.niveau;
    actualiserCommandeOscEvenement(suivant);
  }
}

/**
 * Copie la timeline des pistes rasp XX et prepare les /play minutes.
 */
export default class RaspberrySequenceurOscService {
  constructor(private readonly pont: IWamPistesPont) {}

  public copierDepuisPistes(raspberries: Raspberry[]): EvenementSequenceurOsc[] {
    const regions = garderUnePisteParRaspberry(this.pont.listerRegionsPistesRaspberry());
    return regions.map((region) => {
      const depuisFichier = extraireNumeroSonOscDepuisFichier(region.nomFichier);
      const sonNumber = region.sonNumber ?? depuisFichier;
      const ip = trouverIpPourNumero(raspberries, region.raspberryId);
      const evenement: EvenementSequenceurOsc = {
        raspberryId: region.raspberryId,
        nomPiste: region.nomPiste,
        ip,
        startMs: region.startMs,
        endMs: region.endMs,
        sonNumber,
        nomFichier: region.nomFichier,
        nomAffiche: region.nomAffiche,
        niveau: OSC_PLAY_NIVEAU_DEFAUT,
        commandeOsc: "",
      };
      actualiserCommandeOscEvenement(evenement);
      return evenement;
    });
  }

  public formaterLigneEvenement(evenement: EvenementSequenceurOsc): string {
    const son =
      evenement.nomAffiche && evenement.nomAffiche !== "son ?"
        ? evenement.nomAffiche
        : evenement.sonNumber !== null
          ? `son${evenement.sonNumber}`
          : "son ?";
    return `${evenement.nomPiste}  ${son}  niv.${evenement.niveau}  ${formaterTempsPiste(evenement.startMs)} → ${formaterTempsPiste(evenement.endMs)}`;
  }
}

export function trouverIpPourNumero(
  raspberries: Raspberry[],
  raspberryId: number
): string | null {
  const parOctet = raspberries.find(
    (raspberry) => extraireNumeroRaspberryDepuisIp(raspberry.ip) === raspberryId
  );
  if (parOctet?.ip) {
    return parOctet.ip;
  }
  const parInfo = raspberries.find((raspberry) => {
    const match = raspberry.info.match(/Raspberry\s+(\d+)/i);
    return match !== null && Number.parseInt(match[1], 10) === raspberryId;
  });
  if (parInfo?.ip) {
    return parInfo.ip;
  }
  const binding = raspberryTrackBindingStore.trouverPremierParRaspberryId(raspberryId);
  if (!binding) {
    return null;
  }
  if (extraireNumeroRaspberryDepuisIp(binding.raspberryIp) !== raspberryId) {
    return null;
  }
  return binding.raspberryIp;
}

/**
 * Une seule piste par Raspberry : les doublons (ex. deux rasp 74) bloquaient le /play.
 */
export function garderUnePisteParRaspberry(
  regions: RegionPisteRaspberry[]
): RegionPisteRaspberry[] {
  const parPiste = new Map<string, RegionPisteRaspberry[]>();
  for (const region of regions) {
    const cle = `${region.raspberryId}:${region.trackId}`;
    const liste = parPiste.get(cle) ?? [];
    liste.push(region);
    parPiste.set(cle, liste);
  }

  const meilleureParRaspberry = new Map<number, RegionPisteRaspberry[]>();
  for (const liste of parPiste.values()) {
    const raspberryId = liste[0]?.raspberryId;
    if (raspberryId === undefined) {
      continue;
    }
    const actuelle = meilleureParRaspberry.get(raspberryId);
    if (!actuelle || pisteEstPlusComplete(liste, actuelle)) {
      meilleureParRaspberry.set(raspberryId, liste);
    }
  }

  return [...meilleureParRaspberry.values()]
    .flat()
    .sort((a, b) => a.startMs - b.startMs || a.raspberryId - b.raspberryId);
}

function pisteEstPlusComplete(
  candidate: RegionPisteRaspberry[],
  actuelle: RegionPisteRaspberry[]
): boolean {
  const nomsCandidate = candidate.filter((region) => region.sonNumber !== null).length;
  const nomsActuelle = actuelle.filter((region) => region.sonNumber !== null).length;
  if (nomsCandidate !== nomsActuelle) {
    return nomsCandidate > nomsActuelle;
  }
  if (candidate.length !== actuelle.length) {
    return candidate.length > actuelle.length;
  }
  return (candidate[0]?.trackId ?? 0) > (actuelle[0]?.trackId ?? 0);
}

export function construireTexteLogOsc(evenement: EvenementSequenceurOsc): string {
  const cible = evenement.ip
    ? `Raspberry ${evenement.raspberryId} (${evenement.ip})`
    : `rasp ${evenement.raspberryId} (IP inconnue)`;
  if (!evenement.commandeOsc) {
    return `[${formaterTempsPiste(evenement.startMs)}] ${cible}  — son inconnu, OSC non envoyee`;
  }
  return `[${formaterTempsPiste(evenement.startMs)}] ${cible}  ${evenement.commandeOsc}`;
}

export type RaspberryProgramme = {
  raspberryId: number;
  ip: string | null;
};

/** Raspberry distincts presents dans le programme (ordre de premiere apparition). */
export function listerRaspberriesUniquesDuProgramme(
  programme: EvenementSequenceurOsc[]
): RaspberryProgramme[] {
  const dejaVus = new Set<number>();
  const resultats: RaspberryProgramme[] = [];
  for (const evenement of programme) {
    if (dejaVus.has(evenement.raspberryId)) {
      continue;
    }
    dejaVus.add(evenement.raspberryId);
    resultats.push({
      raspberryId: evenement.raspberryId,
      ip: evenement.ip,
    });
  }
  return resultats;
}

/** Cibles du bouton Stop : Pi en ligne, plus ceux du programme s'il en manque. */
export function listerRaspberriesPourStop(
  programme: EvenementSequenceurOsc[],
  connectes: RaspberryProgramme[]
): RaspberryProgramme[] {
  const parId = new Map<number, RaspberryProgramme>();
  for (const raspberry of [...connectes, ...listerRaspberriesUniquesDuProgramme(programme)]) {
    if (raspberry.raspberryId < 1) {
      continue;
    }
    const actuel = parId.get(raspberry.raspberryId);
    if (!actuel || (!actuel.ip && raspberry.ip)) {
      parId.set(raspberry.raspberryId, raspberry);
    }
  }
  return [...parId.values()];
}

export function construireTexteLogComposition(
  raspberryId: number,
  ip: string | null
): string {
  const cible = ip
    ? `Raspberry ${raspberryId} (${ip})`
    : `rasp ${raspberryId} (IP inconnue)`;
  return `[preparation] ${cible}  /composition 1`;
}

export function construireTexteLogAttenteComposition(delaiMs: number): string {
  const secondes = (delaiMs / 1000).toFixed(delaiMs % 1000 === 0 ? 0 : 1);
  return `[preparation] Attente ${secondes} s après /composition avant le premier /play.`;
}

export function construireTexteLogStopRegion(evenement: EvenementSequenceurOsc): string {
  const cible = evenement.ip
    ? `Raspberry ${evenement.raspberryId} (${evenement.ip})`
    : `rasp ${evenement.raspberryId} (IP inconnue)`;
  return `[${formaterTempsPiste(evenement.endMs)}] ${cible}  /stop -1`;
}

/** Pi en ligne, avec un numero d'IP utilisable pour OSC. */
export function listerRaspberriesEnLigne(
  raspberries: Array<{ ip: string; isOnline: boolean }>
): RaspberryProgramme[] {
  const resultats: RaspberryProgramme[] = [];
  const dejaVus = new Set<number>();
  for (const raspberry of raspberries) {
    if (!raspberry.isOnline) {
      continue;
    }
    const raspberryId = extraireNumeroRaspberryDepuisIp(raspberry.ip);
    if (raspberryId === undefined || raspberryId < 1 || dejaVus.has(raspberryId)) {
      continue;
    }
    dejaVus.add(raspberryId);
    resultats.push({ raspberryId, ip: raspberry.ip });
  }
  return resultats;
}
