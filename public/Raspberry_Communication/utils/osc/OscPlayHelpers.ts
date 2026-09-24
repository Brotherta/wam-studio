import { extraireNumeroSkiniDepuisNom } from "./AttributionNumerosSons";
import { CHEMIN_SONS_SKINI_PI } from "../agent-transfert/AgentTransfertHelpers";

export const REPERTOIRE_SONS_SKINI = CHEMIN_SONS_SKINI_PI;

export type OscPlayDraft = {
  sonNumber: number;
  level: number;
  fichier: string;
};

export type OscPlayBrouillon = {
  playSonNumber?: number;
  playLevel?: number;
  playFichier?: string;
};

export const OSC_PLAY_NIVEAU_DEFAUT = 75;

export const OSC_PLAY_ARGUMENTS_DEFAUT = `1 ${OSC_PLAY_NIVEAU_DEFAUT}`;

export function lireNiveauPlay(valeur: string): number {
  const niveau = Number.parseInt(valeur, 10);
  if (!Number.isFinite(niveau)) {
    return OSC_PLAY_NIVEAU_DEFAUT;
  }
  return Math.min(127, Math.max(0, niveau));
}

export function construireArgumentsPlay(draft: OscPlayDraft): string {
  return `${draft.sonNumber} ${draft.level}`;
}

export function formaterApercuCommandePlay(draft: OscPlayDraft): string {
  return `/play ${construireArgumentsPlay(draft)}`;
}

export function estFichierSonAffichable(nomFichier: string): boolean {
  const nom = nomFichier.trim();
  return nom.length > 0 && !nom.startsWith(".");
}

/** Numero OSC uniquement depuis le nom Skini (son500.wav). daylight.wav n'est pas jouable. */
export function extraireNumeroSonOscDepuisFichier(nomFichier: string): number | null {
  const nom = nomFichier.trim();
  const matchSkini = extraireNumeroSkiniDepuisNom(nom);
  if (matchSkini !== null) {
    return matchSkini;
  }
  const matchAncienWam = nom.match(/^rasp\d+-son(\d+)/i);
  if (matchAncienWam) {
    return Number.parseInt(matchAncienWam[1], 10);
  }
  return null;
}

export function estFichierSonJouable(nomFichier: string): boolean {
  if (!estFichierSonAffichable(nomFichier)) {
    return false;
  }
  const numero = extraireNumeroSonOscDepuisFichier(nomFichier);
  return numero !== null && numero >= 0;
}

export function formaterLibelleFichierPlay(
  nomFichier: string,
  libelles: Record<string, string> = {}
): string {
  const nomCourt = nomFichier.replace(/\\/g, "/").split("/").pop() || nomFichier;
  const sansExtension = nomCourt.replace(/\.[^.]+$/, "").trim() || nomCourt;
  const libelle = (libelles[nomFichier] ?? libelles[nomCourt])?.trim();
  if (libelle && libelle !== sansExtension) {
    return `${libelle} — ${nomCourt}`;
  }
  return sansExtension;
}

export function construireOscPlayDraftDepuisFichier(
  fichier: string,
  level: number = OSC_PLAY_NIVEAU_DEFAUT
): OscPlayDraft | null {
  if (!estFichierSonJouable(fichier)) {
    return null;
  }
  const sonNumber = extraireNumeroSonOscDepuisFichier(fichier);
  if (sonNumber === null || sonNumber < 0) {
    return null;
  }
  return {
    sonNumber,
    level,
    fichier,
  };
}

export function lireOscPlayDraftDepuisBrouillon(
  draft: OscPlayBrouillon | undefined,
  fichiersDisponibles: string[] = []
): OscPlayDraft | null {
  const fichierPropose = draft?.playFichier;
  const fichier =
    fichierPropose &&
    fichiersDisponibles.includes(fichierPropose) &&
    estFichierSonJouable(fichierPropose)
      ? fichierPropose
      : fichiersDisponibles.find((nom) => estFichierSonJouable(nom));

  if (!fichier) {
    return null;
  }

  return construireOscPlayDraftDepuisFichier(fichier, OSC_PLAY_NIVEAU_DEFAUT);
}

export function texteStatutFichiersPlay(fichiers: string[]): string {
  const nbJouables = fichiers.filter(estFichierSonJouable).length;
  const nbVisibles = fichiers.filter(estFichierSonAffichable).length;
  if (nbJouables > 0) {
    return `${nbJouables} son(s) jouable(s) dans sons/ — OSC: /play {numero} ${OSC_PLAY_NIVEAU_DEFAUT}`;
  }
  if (nbVisibles > 0) {
    return "Fichiers présents mais non jouables : Skini lit uniquement son500.wav, son501.wav, … Renvoyez-les via Send Audio.";
  }
  return "Aucun son jouable dans sons/";
}

export function estCommandePlay(adresse: string): boolean {
  const normalise = adresse.trim().toLowerCase();
  return normalise === "/play" || normalise === "play";
}
