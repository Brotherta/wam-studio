import type { EvenementSequenceurOsc } from "./RaspberrySequenceurOscService";
import {
  construireTexteLogOsc,
  construireTexteLogStopRegion,
} from "./RaspberrySequenceurOscService";

export type ResultatEnvoiOsc = { ok: boolean; detail: string };

export type HoteJoueurSequenceur = {
  envoyerOsc: (evenement: EvenementSequenceurOsc) => ResultatEnvoiOsc;
  envoyerStop: (evenement: EvenementSequenceurOsc) => ResultatEnvoiOsc;
  estLectureActive: () => boolean;
  onLog: (texte: string, raspberryId: number | null) => void;
  attendreMs?: (dureeMs: number) => Promise<void>;
};

function attendreParDefaut(dureeMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, dureeMs);
  });
}

function dureeSonMs(evenement: EvenementSequenceurOsc): number {
  const duree = evenement.endMs - evenement.startMs;
  if (!Number.isFinite(duree) || duree <= 0) {
    return 0;
  }
  return duree;
}

function journaliser(
  hote: HoteJoueurSequenceur,
  raspberryId: number,
  ligne: string,
  resultat: ResultatEnvoiOsc
): void {
  hote.onLog(resultat.ok ? ligne : `${ligne} — ${resultat.detail}`, raspberryId);
}

/**
 * /play au debut de la region, /stop -1 a la fin (duree WAM), pour couper un WAV plus long.
 * Un Raspberry a la fois : le /play suivant attend ce /stop.
 */
export function creerJoueurSequenceur(hote: HoteJoueurSequenceur): {
  jouer: (evenement: EvenementSequenceurOsc) => Promise<void>;
  reinitialiser: () => void;
} {
  const files = new Map<number, Promise<void>>();
  const attendre = hote.attendreMs ?? attendreParDefaut;
  let generation = 0;

  const executer = async (evenement: EvenementSequenceurOsc): Promise<void> => {
    const generationAuDebut = generation;
    if (!hote.estLectureActive() || generation !== generationAuDebut) {
      return;
    }
    const envoiPlay = hote.envoyerOsc(evenement);
    journaliser(hote, evenement.raspberryId, construireTexteLogOsc(evenement), envoiPlay);

    const duree = dureeSonMs(evenement);
    if (duree <= 0) {
      return;
    }
    await attendre(duree);
    if (!hote.estLectureActive() || generation !== generationAuDebut) {
      return;
    }
    const envoiStop = hote.envoyerStop(evenement);
    journaliser(hote, evenement.raspberryId, construireTexteLogStopRegion(evenement), envoiStop);
  };

  return {
    jouer: (evenement) => {
      const generationCourante = generation;
      const precedent = files.get(evenement.raspberryId) ?? Promise.resolve();
      const suivant = precedent.then(
        () => {
          if (generation !== generationCourante) {
            return;
          }
          return executer(evenement);
        },
        () => {
          if (generation !== generationCourante) {
            return;
          }
          return executer(evenement);
        }
      );
      files.set(evenement.raspberryId, suivant);
      return suivant;
    },
    reinitialiser: () => {
      generation += 1;
      files.clear();
    },
  };
}
