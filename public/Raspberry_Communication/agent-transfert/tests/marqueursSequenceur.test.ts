import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formaterTempsPiste, parserTempsPiste } from "../../utils/osc/FormatTempsPiste";
import { calculerTempsMsDepuisXCanvas } from "../../utils/osc/TempsMarqueurPiste";
import {
  fusionnerProgrammeEtMarqueurs,
  parserAdresseOscPersonnalisee,
  evenementDepuisMarqueur,
} from "../../Services/RaspberryMarqueursSequenceur";
import {
  idsCuesALiberer,
  trouverCueADeclencher,
} from "../../Services/RaspberryMarqueursCueDetection";
import {
  ajouterMarqueurSequenceur,
  ecrireMarqueursSequenceur,
  lireMarqueursSequenceur,
  mettreAJourMarqueurSequenceur,
  supprimerMarqueurSequenceur,
} from "../../Services/RaspberryMarqueursStore";
import { lancerLectureSequenceur } from "../../Services/RaspberrySequenceurLecture";
import type { EvenementSequenceurOsc } from "../../Services/RaspberrySequenceurOscService";
import type { MarqueurSequenceur } from "../../Models/MarqueurSequenceur";

const memoire = new Map<string, string>();
const stockage = {
  getItem: (cle: string) => memoire.get(cle) ?? null,
  setItem: (cle: string, valeur: string) => {
    memoire.set(cle, valeur);
  },
  removeItem: (cle: string) => {
    memoire.delete(cle);
  },
  clear: () => memoire.clear(),
  key: (index: number) => [...memoire.keys()][index] ?? null,
  get length() {
    return memoire.size;
  },
};

Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: stockage,
    dispatchEvent: () => true,
  },
  configurable: true,
});

function playTest(startMs: number, commandeOsc: string): EvenementSequenceurOsc {
  return {
    raspberryId: 75,
    nomPiste: "rasp 75",
    ip: "192.168.1.75",
    startMs,
    endMs: startMs + 1000,
    sonNumber: 500,
    nomFichier: "son500.wav",
    nomAffiche: "son500",
    niveau: 75,
    commandeOsc,
  };
}

function marqueurTest(partial: Partial<MarqueurSequenceur> & Pick<MarqueurSequenceur, "id" | "type" | "tempsMs">): MarqueurSequenceur {
  return {
    libelle: "",
    oscAdresse: "",
    oscValeur: "",
    ...partial,
  };
}

afterEach(() => {
  memoire.clear();
});

describe("parserTempsPiste", () => {
  it("accepte 1min40, 1:40 et 40s", () => {
    expect(parserTempsPiste("1min40")).toBe(100_000);
    expect(parserTempsPiste("1:40")).toBe(100_000);
    expect(parserTempsPiste("40s")).toBe(40_000);
    expect(parserTempsPiste("40")).toBe(40_000);
    expect(formaterTempsPiste(parserTempsPiste("1min40") ?? 0)).toBe("1min40");
  });

  it("refuse un texte vide", () => {
    expect(parserTempsPiste("")).toBeNull();
    expect(parserTempsPiste("abc")).toBeNull();
  });
});

describe("calculerTempsMsDepuisXCanvas", () => {
  it("convertit un clic canvas en temps de piste", () => {
    expect(calculerTempsMsDepuisXCanvas(100, 0, 10)).toBe(1000);
    expect(calculerTempsMsDepuisXCanvas(50, 50, 10)).toBe(1000);
    expect(calculerTempsMsDepuisXCanvas(-10, 0, 10)).toBe(0);
  });
});

describe("parserAdresseOscPersonnalisee", () => {
  it("separe adresse et valeur", () => {
    expect(parserAdresseOscPersonnalisee("/go", "1")).toEqual({ message: "/go", value: "1" });
    expect(parserAdresseOscPersonnalisee("/go 2", "")).toEqual({ message: "/go", value: "2" });
    expect(parserAdresseOscPersonnalisee("go", "1")).toBeNull();
  });
});

describe("fusionnerProgrammeEtMarqueurs", () => {
  it("copie les OSC mais ignore les cues (lecture WAM uniquement)", () => {
    const fusion = fusionnerProgrammeEtMarqueurs(
      [playTest(1000, "/play 500 75")],
      [
        marqueurTest({ id: "c1", type: "cue", tempsMs: 1000, libelle: "attente" }),
        marqueurTest({ id: "o1", type: "osc", tempsMs: 1000, oscAdresse: "/go", oscValeur: "1" }),
      ]
    );
    expect(fusion.map((item) => item.kind ?? "play")).toEqual(["play", "osc"]);
  });

  it("convertit un cue en evenement Espace", () => {
    const evenement = evenementDepuisMarqueur(
      marqueurTest({ id: "c1", type: "cue", tempsMs: 2000, libelle: "couplet" })
    );
    expect(evenement.kind).toBe("cue");
    expect(evenement.commandeOsc).toBe("cue (Espace)");
    expect(evenement.nomAffiche).toBe("couplet");
  });
});

describe("trouverCueADeclencher", () => {
  const cue = { id: "c1", tempsMs: 5000 };

  it("declenche quand la lecture franchit le cue", () => {
    expect(
      trouverCueADeclencher({
        playheadMs: 5010,
        playheadPrecedentMs: 4980,
        enLecture: true,
        enLecturePrecedent: true,
        cues: [cue],
        cuesConsommes: new Set(),
      })?.id
    ).toBe("c1");
  });

  it("declenche si on lance la lecture pile sur le cue", () => {
    expect(
      trouverCueADeclencher({
        playheadMs: 5000,
        playheadPrecedentMs: 5000,
        enLecture: true,
        enLecturePrecedent: false,
        cues: [cue],
        cuesConsommes: new Set(),
      })?.id
    ).toBe("c1");
  });

  it("ne declenche pas sans lecture", () => {
    expect(
      trouverCueADeclencher({
        playheadMs: 5010,
        playheadPrecedentMs: 4980,
        enLecture: false,
        enLecturePrecedent: false,
        cues: [cue],
        cuesConsommes: new Set(),
      })
    ).toBeNull();
  });

  it("ne redeclenche pas un cue deja consomme", () => {
    expect(
      trouverCueADeclencher({
        playheadMs: 5010,
        playheadPrecedentMs: 4980,
        enLecture: true,
        enLecturePrecedent: true,
        cues: [cue],
        cuesConsommes: new Set(["c1"]),
      })
    ).toBeNull();
  });

  it("libere le cue si on revient avant sa position", () => {
    expect(idsCuesALiberer(1000, [cue], new Set(["c1"]))).toEqual(["c1"]);
    expect(idsCuesALiberer(5000, [cue], new Set(["c1"]))).toEqual([]);
  });
});

describe("RaspberryMarqueursStore", () => {
  it("enregistre et retire un marqueur", () => {
    ajouterMarqueurSequenceur(
      marqueurTest({ id: "m1", type: "osc", tempsMs: 500, libelle: "go", oscAdresse: "/go", oscValeur: "1" })
    );
    expect(lireMarqueursSequenceur()).toHaveLength(1);
    supprimerMarqueurSequenceur("m1");
    expect(lireMarqueursSequenceur()).toHaveLength(0);
    ecrireMarqueursSequenceur([]);
  });

  it("garde une valeur OSC distincte par marqueur", () => {
    ajouterMarqueurSequenceur(
      marqueurTest({ id: "l0", type: "osc", tempsMs: 1000, libelle: "Level", oscAdresse: "/level", oscValeur: "0" })
    );
    ajouterMarqueurSequenceur(
      marqueurTest({ id: "l90", type: "osc", tempsMs: 2000, libelle: "Level", oscAdresse: "/level", oscValeur: "90" })
    );
    const liste = lireMarqueursSequenceur();
    expect(liste.map((item) => item.oscValeur)).toEqual(["0", "90"]);
    mettreAJourMarqueurSequenceur("l0", { oscValeur: "10" });
    expect(lireMarqueursSequenceur().find((item) => item.id === "l90")?.oscValeur).toBe("90");
    expect(lireMarqueursSequenceur().find((item) => item.id === "l0")?.oscValeur).toBe("10");
    expect(evenementDepuisMarqueur(lireMarqueursSequenceur()[0]!).commandeOsc).toBe("/level 10");
    expect(evenementDepuisMarqueur(lireMarqueursSequenceur()[1]!).commandeOsc).toBe("/level 90");
  });
});

describe("lancerLectureSequenceur — cue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("attend reprendre avant le /play suivant", () => {
    const recus: string[] = [];
    const cue: EvenementSequenceurOsc = {
      ...playTest(100, "cue (Espace)"),
      kind: "cue",
      sonNumber: null,
      commandeOsc: "cue (Espace)",
      nomPiste: "Cue",
      nomAffiche: "attente",
    };
    const controle = lancerLectureSequenceur({
      evenements: [playTest(0, "/play 500 75"), cue, playTest(300, "/play 501 75")],
      delaiDemarrageMs: 0,
      onTick: () => undefined,
      onEvenement: (evenement) => {
        recus.push(evenement.commandeOsc);
      },
      onFin: () => undefined,
    });

    vi.advanceTimersByTime(0);
    expect(recus).toEqual(["/play 500 75"]);
    vi.advanceTimersByTime(100);
    expect(recus).toEqual(["/play 500 75", "cue (Espace)"]);
    vi.advanceTimersByTime(2000);
    expect(recus).toEqual(["/play 500 75", "cue (Espace)"]);
    expect(controle.estEnPauseCue()).toBe(true);
    controle.reprendre();
    vi.advanceTimersByTime(200);
    expect(recus).toEqual(["/play 500 75", "cue (Espace)", "/play 501 75"]);
  });
});
