import type { MarqueurSequenceur } from "../Models/MarqueurSequenceur";
import { formaterTempsPiste } from "../utils/osc/FormatTempsPiste";
import type { EvenementSequenceurOsc } from "./RaspberrySequenceurOscService";

const POIDS_KIND: Record<string, number> = {
  play: 0,
  osc: 1,
  cue: 2,
};

export function lireKindEvenement(evenement: EvenementSequenceurOsc): "play" | "osc" | "cue" {
  if (evenement.kind === "osc" || evenement.kind === "cue") {
    return evenement.kind;
  }
  return "play";
}

export function estEvenementMarqueur(evenement: EvenementSequenceurOsc): boolean {
  const kind = lireKindEvenement(evenement);
  return kind === "osc" || kind === "cue";
}

export function estEvenementCue(evenement: EvenementSequenceurOsc): boolean {
  return lireKindEvenement(evenement) === "cue";
}

export function parserAdresseOscPersonnalisee(
  adresse: string,
  valeur: string
): { message: string; value: string } | null {
  const brut = adresse.trim();
  if (!brut.startsWith("/")) {
    return null;
  }
  const parties = brut.split(/\s+/);
  const message = parties[0] ?? "";
  if (!/^\/[A-Za-z0-9/_-]+$/.test(message)) {
    return null;
  }
  const resteAdresse = parties.slice(1).join(" ").trim();
  const value = (resteAdresse || valeur.trim()).trim();
  return { message, value };
}

export function evenementDepuisMarqueur(marqueur: MarqueurSequenceur): EvenementSequenceurOsc {
  const libelle =
    marqueur.libelle ||
    (marqueur.type === "cue"
      ? "Cue"
      : `${marqueur.oscAdresse} ${marqueur.oscValeur}`.trim() || "OSC");
  const commandeOsc =
    marqueur.type === "cue"
      ? "cue (Espace)"
      : `${marqueur.oscAdresse} ${marqueur.oscValeur}`.trim();
  return {
    kind: marqueur.type,
    idMarqueur: marqueur.id,
    raspberryId: 0,
    nomPiste: marqueur.type === "cue" ? "Cue" : "OSC",
    ip: null,
    startMs: marqueur.tempsMs,
    endMs: marqueur.tempsMs,
    sonNumber: null,
    nomFichier: "",
    nomAffiche: libelle,
    niveau: 0,
    commandeOsc,
    oscAdresse: marqueur.oscAdresse,
    oscValeur: marqueur.oscValeur,
  };
}

export function fusionnerProgrammeEtMarqueurs(
  plays: EvenementSequenceurOsc[],
  marqueurs: MarqueurSequenceur[]
): EvenementSequenceurOsc[] {
  const marqueursOsc = marqueurs.filter((marqueur) => marqueur.type === "osc");
  const fusion = [
    ...plays.map((play) => ({ ...play, kind: play.kind ?? "play" })),
    ...marqueursOsc.map(evenementDepuisMarqueur),
  ];
  fusion.sort((a, b) => {
    const delta = a.startMs - b.startMs;
    if (delta !== 0) {
      return delta;
    }
    return (POIDS_KIND[lireKindEvenement(a)] ?? 0) - (POIDS_KIND[lireKindEvenement(b)] ?? 0);
  });
  return fusion;
}

export function construireTexteLogMarqueur(evenement: EvenementSequenceurOsc): string {
  const timer = `[${formaterTempsPiste(evenement.startMs)}]`;
  if (estEvenementCue(evenement)) {
    return `${timer} Cue « ${evenement.nomAffiche} » — Espace pour continuer`;
  }
  return `${timer} OSC  ${evenement.commandeOsc}  → tous les Raspberry`;
}
