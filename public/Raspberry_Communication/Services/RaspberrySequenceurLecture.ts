import type { EvenementSequenceurOsc } from "./RaspberrySequenceurOscService";
import { estEvenementCue } from "./RaspberryMarqueursSequenceur";

export type ControleLectureSequenceur = {
  arreter: () => void;
  reprendre: () => void;
  estEnPauseCue: () => boolean;
};

/** Skini ignore /play tant que /composition n'a pas fini de charger. */
export const DELAI_APRES_COMPOSITION_MS = 1000;

const INTERVALLE_TICK_MS = 100;
const MARGE_FIN_MS = 400;

function lireStartMs(evenement: EvenementSequenceurOsc): number {
  return Number.isFinite(evenement.startMs) ? Math.max(0, evenement.startMs) : 0;
}

function estPromesse(valeur: unknown): valeur is Promise<unknown> {
  return Boolean(valeur && typeof (valeur as Promise<unknown>).then === "function");
}

/**
 * Declenche les evenements aux timers copies depuis les pistes.
 * Un cue met la lecture en pause jusqu'a reprendre() (Espace).
 * delaiDemarrageMs : pause avant t=0, pour laisser /composition s'appliquer.
 * onFin : seulement apres le dernier evenement (et sa promesse), jamais en coupant un /play.
 */
export function lancerLectureSequenceur(params: {
  evenements: EvenementSequenceurOsc[];
  onTick: (timerMs: number) => void;
  onEvenement: (evenement: EvenementSequenceurOsc) => void | Promise<void>;
  onFin: () => void;
  delaiDemarrageMs?: number;
}): ControleLectureSequenceur {
  const evenements = [...params.evenements];
  const timers: Array<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>> = [];
  let actif = true;
  let enPauseCue = false;
  let indexSuivant = 0;
  let promessesOuvertes = 0;
  let finProgrammee = false;
  const delai = Math.max(0, params.delaiDemarrageMs ?? 0);
  const debut = performance.now() + delai;
  let pauseCumuleeMs = 0;
  let debutPauseMs = 0;
  let dernierTickMs = 0;

  const arreterTimers = (): void => {
    timers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    timers.length = 0;
  };

  const terminer = (): void => {
    if (!actif) {
      return;
    }
    actif = false;
    enPauseCue = false;
    arreterTimers();
    params.onFin();
  };

  const programmerFin = (): void => {
    if (!actif || enPauseCue || indexSuivant < evenements.length || promessesOuvertes > 0 || finProgrammee) {
      return;
    }
    finProgrammee = true;
    const fin = setTimeout(terminer, MARGE_FIN_MS);
    timers.push(fin);
  };

  const lireTimerMs = (): number => {
    if (enPauseCue) {
      return dernierTickMs;
    }
    return Math.max(0, performance.now() - debut - pauseCumuleeMs);
  };

  const programmerSuivant = (): void => {
    if (!actif || enPauseCue) {
      return;
    }
    if (indexSuivant >= evenements.length) {
      programmerFin();
      return;
    }
    const evenement = evenements[indexSuivant];
    if (!evenement) {
      programmerFin();
      return;
    }
    const precedentStart = indexSuivant === 0 ? 0 : lireStartMs(evenements[indexSuivant - 1]!);
    const gap = Math.max(0, lireStartMs(evenement) - precedentStart);
    const attenteMs = (indexSuivant === 0 ? delai : 0) + gap;
    const timer = setTimeout(() => {
      if (!actif) {
        return;
      }
      indexSuivant += 1;
      const resultat = params.onEvenement(evenement);
      if (estPromesse(resultat)) {
        promessesOuvertes += 1;
        const apres = (): void => {
          promessesOuvertes -= 1;
          programmerFin();
        };
        void resultat.then(apres, apres);
      }
      if (estEvenementCue(evenement)) {
        enPauseCue = true;
        debutPauseMs = performance.now();
        dernierTickMs = lireStartMs(evenement);
        return;
      }
      programmerSuivant();
    }, attenteMs);
    timers.push(timer);
  };

  params.onTick(0);
  const tick = setInterval(() => {
    if (!actif) {
      return;
    }
    dernierTickMs = lireTimerMs();
    params.onTick(dernierTickMs);
  }, INTERVALLE_TICK_MS);
  timers.push(tick);

  if (evenements.length === 0) {
    const fin = setTimeout(terminer, delai + MARGE_FIN_MS);
    timers.push(fin);
    return {
      arreter: () => {
        actif = false;
        enPauseCue = false;
        arreterTimers();
      },
      reprendre: () => undefined,
      estEnPauseCue: () => false,
    };
  }

  programmerSuivant();

  return {
    arreter: () => {
      actif = false;
      enPauseCue = false;
      arreterTimers();
    },
    reprendre: () => {
      if (!actif || !enPauseCue) {
        return;
      }
      pauseCumuleeMs += Math.max(0, performance.now() - debutPauseMs);
      enPauseCue = false;
      programmerSuivant();
    },
    estEnPauseCue: () => actif && enPauseCue,
  };
}
