export const GAIN_OSC_DEFAUT = "90";
export const GAIN_OSC_MAX = 104;
export const SON_OSC_DEFAUT = "1";

export type IdCommandeOscMarqueur =
  | "play"
  | "stop"
  | "stop-all"
  | "level"
  | "loop"
  | "attenuation";

export type EmplacementOscMarqueur = {
  id: string;
  libelle: string;
  valeurDefaut: string;
  placeholder: string;
};

export type ModeleCommandeOscMarqueur = {
  id: IdCommandeOscMarqueur;
  libelleMenu: string;
  libelleCourt: string;
  adresse: string;
  emplacements: EmplacementOscMarqueur[];
};

export type CommandeOscComposee = {
  adresse: string;
  valeur: string;
  apercu: string;
};

export const MODELES_COMMANDES_OSC_MARQUEUR: ModeleCommandeOscMarqueur[] = [
  {
    id: "play",
    libelleMenu: "play",
    libelleCourt: "Play",
    adresse: "/play",
    emplacements: [
      { id: "son", libelle: "son", valeurDefaut: SON_OSC_DEFAUT, placeholder: "n° son" },
      { id: "gain", libelle: "gain", valeurDefaut: GAIN_OSC_DEFAUT, placeholder: "0–104" },
    ],
  },
  {
    id: "stop",
    libelleMenu: "stop",
    libelleCourt: "Stop",
    adresse: "/stop",
    emplacements: [
      { id: "son", libelle: "son", valeurDefaut: SON_OSC_DEFAUT, placeholder: "n° son" },
      { id: "fade", libelle: "fade ms", valeurDefaut: "", placeholder: "4000 (optionnel)" },
    ],
  },
  {
    id: "stop-all",
    libelleMenu: "stop all",
    libelleCourt: "Stop all",
    adresse: "/stop",
    emplacements: [
      { id: "cible", libelle: "cible", valeurDefaut: "-1", placeholder: "-1 = tout" },
    ],
  },
  {
    id: "level",
    libelleMenu: "level",
    libelleCourt: "Level",
    adresse: "/level",
    emplacements: [
      { id: "gain", libelle: "gain", valeurDefaut: GAIN_OSC_DEFAUT, placeholder: "0–104" },
    ],
  },
  {
    id: "loop",
    libelleMenu: "loop",
    libelleCourt: "Loop",
    adresse: "/loop",
    emplacements: [
      { id: "son", libelle: "son", valeurDefaut: SON_OSC_DEFAUT, placeholder: "n° son" },
      { id: "actif", libelle: "on/off", valeurDefaut: "1", placeholder: "1 = on, 0 = off" },
    ],
  },
  {
    id: "attenuation",
    libelleMenu: "attenuation",
    libelleCourt: "Attenuation",
    adresse: "/attenuation",
    emplacements: [
      { id: "son", libelle: "son", valeurDefaut: SON_OSC_DEFAUT, placeholder: "n° son" },
      { id: "gain", libelle: "gain", valeurDefaut: GAIN_OSC_DEFAUT, placeholder: "0–104" },
    ],
  },
];

export function trouverModeleCommandeOsc(
  id: string
): ModeleCommandeOscMarqueur | undefined {
  return MODELES_COMMANDES_OSC_MARQUEUR.find((modele) => modele.id === id);
}

export function composerCommandeOscMarqueur(
  adresse: string,
  argumentsTextes: string[]
): CommandeOscComposee {
  const adressePropre = adresse.trim();
  const valeur = argumentsTextes
    .map((texte) => texte.trim())
    .filter((texte) => texte.length > 0)
    .join(" ");
  return {
    adresse: adressePropre,
    valeur,
    apercu: `${adressePropre} ${valeur}`.trim(),
  };
}

export function composerCommandeOscDepuisModele(
  modele: ModeleCommandeOscMarqueur,
  argumentsTextes?: string[]
): CommandeOscComposee {
  const valeurs =
    argumentsTextes ?? modele.emplacements.map((emplacement) => emplacement.valeurDefaut);
  return composerCommandeOscMarqueur(modele.adresse, valeurs);
}

export function infererIdCommandeOsc(
  adresse: string,
  valeur: string
): IdCommandeOscMarqueur {
  const adresseNormale = adresse.trim().toLowerCase();
  const premier = valeur.trim().split(/\s+/).filter((item) => item.length > 0)[0] ?? "";
  if (adresseNormale === "/level") {
    return "level";
  }
  if (adresseNormale === "/loop") {
    return "loop";
  }
  if (adresseNormale === "/attenuation") {
    return "attenuation";
  }
  if (adresseNormale === "/stop") {
    return premier === "-1" ? "stop-all" : "stop";
  }
  return "play";
}

export function decouperValeurOsc(valeur: string, nombreEmplacements: number): string[] {
  const argumentsOsc = valeur.trim() === "" ? [] : valeur.trim().split(/\s+/);
  const resultats: string[] = [];
  for (let index = 0; index < nombreEmplacements; index++) {
    if (index === nombreEmplacements - 1 && argumentsOsc.length > nombreEmplacements) {
      resultats.push(argumentsOsc.slice(index).join(" "));
    } else {
      resultats.push(argumentsOsc[index] ?? "");
    }
  }
  return resultats;
}

export function texteEtiquetteMarqueur(marqueur: {
  type: string;
  libelle: string;
  oscAdresse: string;
  oscValeur: string;
}): string {
  if (marqueur.type === "cue") {
    return marqueur.libelle || "Cue";
  }
  const apercu = `${marqueur.oscAdresse} ${marqueur.oscValeur}`.trim();
  return apercu || marqueur.libelle || "OSC";
}

export function gainOscVersVolumePiste(gainTexte: string): number {
  const gain = Number.parseFloat(gainTexte);
  if (!Number.isFinite(gain)) {
    return Number.parseFloat(GAIN_OSC_DEFAUT) / GAIN_OSC_MAX;
  }
  return Math.min(1, Math.max(0, gain / GAIN_OSC_MAX));
}
