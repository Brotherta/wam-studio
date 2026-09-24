import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import { lireMarqueursSequenceur } from "./RaspberryMarqueursStore";
import {
  idsCuesALiberer,
  trouverCueADeclencher,
  type CueTimeline,
} from "./RaspberryMarqueursCueDetection";
import { appliquerEffetOscSurPistes } from "./RaspberryMarqueursOscPisteEffet";

let pontCourant: IWamPistesPont | null = null;
let desabonnementPlayhead: (() => void) | null = null;
let timerPoll: number | null = null;
let playheadPrecedentMs = 0;
let enLecturePrecedent = false;
const oscConsommes = new Set<string>();

function listerOsc(): CueTimeline[] {
  return lireMarqueursSequenceur()
    .filter((marqueur) => marqueur.type === "osc")
    .map((marqueur) => ({ id: marqueur.id, tempsMs: marqueur.tempsMs }));
}

function appliquerMarqueurOsc(id: string): void {
  const marqueur = lireMarqueursSequenceur().find((item) => item.id === id);
  if (!marqueur || !pontCourant) {
    return;
  }
  appliquerEffetOscSurPistes(pontCourant, marqueur.oscAdresse, marqueur.oscValeur);
}

function onPlayhead(playheadMs: number): void {
  if (!pontCourant) {
    return;
  }
  const osc = listerOsc();
  for (const id of idsCuesALiberer(playheadMs, osc, oscConsommes)) {
    oscConsommes.delete(id);
  }

  const enLecture = pontCourant.lectureEstActive();
  const marqueur = trouverCueADeclencher({
    playheadMs,
    playheadPrecedentMs,
    enLecture,
    enLecturePrecedent,
    cues: osc,
    cuesConsommes: oscConsommes,
  });
  if (marqueur) {
    oscConsommes.add(marqueur.id);
    appliquerMarqueurOsc(marqueur.id);
  }
  playheadPrecedentMs = playheadMs;
  enLecturePrecedent = pontCourant.lectureEstActive();
}

export function demarrerOscLecturePistes(pont: IWamPistesPont): void {
  if (desabonnementPlayhead) {
    return;
  }
  pontCourant = pont;
  playheadPrecedentMs = pont.lirePlayheadMs();
  enLecturePrecedent = pont.lectureEstActive();
  desabonnementPlayhead = pont.abonnerPlayhead((playheadMs) => onPlayhead(playheadMs));
  timerPoll = window.setInterval(() => {
    onPlayhead(pont.lirePlayheadMs());
  }, 50);
}
