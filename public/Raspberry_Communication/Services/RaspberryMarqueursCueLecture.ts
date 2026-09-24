import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import { lireMarqueursSequenceur } from "./RaspberryMarqueursStore";
import {
  idsCuesALiberer,
  trouverCueADeclencher,
  type CueTimeline,
} from "./RaspberryMarqueursCueDetection";
import { ecrireCueEnAttente, lireCueEnAttente } from "./RaspberryMarqueursCueEtat";
import { actualiserBandeauCuePiste } from "./RaspberryMarqueursPisteUi";

let pontCourant: IWamPistesPont | null = null;
let desabonnementPlayhead: (() => void) | null = null;
let timerPoll: number | null = null;
let playheadPrecedentMs = 0;
let enLecturePrecedent = false;
const cuesConsommes = new Set<string>();

function listerCues(): CueTimeline[] {
  return lireMarqueursSequenceur()
    .filter((marqueur) => marqueur.type === "cue")
    .map((marqueur) => ({ id: marqueur.id, tempsMs: marqueur.tempsMs }));
}

function estToucheEspace(event: KeyboardEvent): boolean {
  return event.code === "Space" || event.key === " ";
}

function cibleEstChampSaisie(event: KeyboardEvent): boolean {
  const cible = event.target as HTMLElement | null;
  return Boolean(cible?.closest("input, textarea, select"));
}

function onToucheEspace(event: KeyboardEvent): void {
  if (!lireCueEnAttente() || !estToucheEspace(event) || cibleEstChampSaisie(event)) {
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.type !== "keydown") {
    return;
  }
  ecrireCueEnAttente(null);
  pontCourant?.reprendreLecture();
  actualiserBandeauCuePiste();
}

function onPlayhead(playheadMs: number): void {
  if (!pontCourant) {
    return;
  }
  const cues = listerCues();
  for (const id of idsCuesALiberer(playheadMs, cues, cuesConsommes)) {
    cuesConsommes.delete(id);
  }

  if (lireCueEnAttente()) {
    playheadPrecedentMs = playheadMs;
    enLecturePrecedent = pontCourant.lectureEstActive();
    return;
  }

  const enLecture = pontCourant.lectureEstActive();
  const cue = trouverCueADeclencher({
    playheadMs,
    playheadPrecedentMs,
    enLecture,
    enLecturePrecedent,
    cues,
    cuesConsommes,
  });
  if (cue) {
    cuesConsommes.add(cue.id);
    ecrireCueEnAttente(cue);
    pontCourant.pauserLecture();
    actualiserBandeauCuePiste();
  }
  playheadPrecedentMs = playheadMs;
  enLecturePrecedent = pontCourant.lectureEstActive();
}

export function demarrerCueLecturePistes(pont: IWamPistesPont): void {
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
  document.addEventListener("keydown", onToucheEspace, true);
  document.addEventListener("keyup", onToucheEspace, true);
}
