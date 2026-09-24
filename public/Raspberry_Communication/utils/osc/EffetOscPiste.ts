import { gainOscVersVolumePiste, infererIdCommandeOsc } from "./CommandesOscMarqueur";

export type EffetOscPiste =
  | { type: "volume"; volume01: number; son?: number }
  | { type: "mute"; mute: boolean; son?: number }
  | { type: "fade-mute"; dureeMs: number; son?: number }
  | { type: "aucun" };

function lireEntier(valeur: string | undefined): number | undefined {
  if (valeur === undefined || valeur.trim() === "") {
    return undefined;
  }
  const nombre = Number.parseInt(valeur, 10);
  return Number.isFinite(nombre) ? nombre : undefined;
}

/**
 * Traduit une commande OSC de marqueur en effet sur les pistes WAM.
 */
export function effetOscVersPiste(adresse: string, valeur: string): EffetOscPiste {
  const id = infererIdCommandeOsc(adresse, valeur);
  const argumentsOsc = valeur.trim().split(/\s+/).filter((item) => item.length > 0);

  if (id === "level") {
    return { type: "volume", volume01: gainOscVersVolumePiste(argumentsOsc[0] ?? "0") };
  }
  if (id === "attenuation") {
    return {
      type: "volume",
      volume01: gainOscVersVolumePiste(argumentsOsc[1] ?? "90"),
      son: lireEntier(argumentsOsc[0]),
    };
  }
  if (id === "play") {
    return {
      type: "volume",
      volume01: gainOscVersVolumePiste(argumentsOsc[1] ?? "90"),
      son: lireEntier(argumentsOsc[0]),
    };
  }
  if (id === "stop-all") {
    return { type: "mute", mute: true };
  }
  if (id === "stop") {
    const son = lireEntier(argumentsOsc[0]);
    const fade = lireEntier(argumentsOsc[1]);
    if (fade !== undefined && fade > 0) {
      return { type: "fade-mute", dureeMs: fade, son };
    }
    return { type: "mute", mute: true, son };
  }
  return { type: "aucun" };
}
