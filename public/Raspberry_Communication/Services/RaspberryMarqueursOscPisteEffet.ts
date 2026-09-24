import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import { effetOscVersPiste } from "../utils/osc/EffetOscPiste";

const PAS_FADE_MS = 50;

let timerFade: number | null = null;

function arreterFade(): void {
  if (timerFade !== null) {
    window.clearInterval(timerFade);
    timerFade = null;
  }
}

function fondreVersSilence(
  pont: IWamPistesPont,
  dureeMs: number,
  sonNumber?: number
): void {
  arreterFade();
  const depart = pont.lireVolumePistes(sonNumber);
  const debut = Date.now();
  if (dureeMs <= 0 || depart <= 0) {
    pont.reglerMutePistes(true, sonNumber);
    return;
  }
  timerFade = window.setInterval(() => {
    const ecoule = Date.now() - debut;
    const reste = Math.max(0, 1 - ecoule / dureeMs);
    pont.reglerVolumePistes(depart * reste, sonNumber);
    if (ecoule >= dureeMs) {
      arreterFade();
      pont.reglerMutePistes(true, sonNumber);
    }
  }, PAS_FADE_MS);
}

/**
 * Applique une commande OSC de marqueur sur le volume / mute des pistes WAM.
 */
export function appliquerEffetOscSurPistes(
  pont: IWamPistesPont,
  adresse: string,
  valeur: string
): void {
  const effet = effetOscVersPiste(adresse, valeur);
  if (effet.type === "aucun") {
    return;
  }
  arreterFade();
  if (effet.type === "volume") {
    pont.reglerVolumePistes(effet.volume01, effet.son);
    return;
  }
  if (effet.type === "mute") {
    pont.reglerMutePistes(effet.mute, effet.son);
    return;
  }
  fondreVersSilence(pont, effet.dureeMs, effet.son);
}
