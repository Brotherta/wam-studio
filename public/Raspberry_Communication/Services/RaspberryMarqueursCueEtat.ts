import type { CueTimeline } from "./RaspberryMarqueursCueDetection";

let cueEnAttente: CueTimeline | null = null;

export function lireCueEnAttente(): CueTimeline | null {
  return cueEnAttente;
}

export function ecrireCueEnAttente(cue: CueTimeline | null): void {
  cueEnAttente = cue;
}
