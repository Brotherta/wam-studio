import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formaterTempsPiste, parserTempsPiste } from "../../utils/osc/FormatTempsPiste";
import {
  construireTexteLogAttenteComposition,
  construireTexteLogOsc,
  construireTexteLogStopRegion,
  garderUnePisteParRaspberry,
  listerRaspberriesEnLigne,
  listerRaspberriesPourStop,
  reporterNiveauxProgramme,
  signatureProgrammeSequenceur,
  type EvenementSequenceurOsc,
} from "../../Services/RaspberrySequenceurOscService";
import { creerJoueurSequenceur } from "../../Services/RaspberrySequenceurJoueur";
import {
  DELAI_APRES_COMPOSITION_MS,
  lancerLectureSequenceur,
} from "../../Services/RaspberrySequenceurLecture";

function evenementTest(
  startMs: number,
  commandeOsc: string,
  options?: { sonNumber?: number; raspberryId?: number; endMs?: number }
): EvenementSequenceurOsc {
  const sonNumber = options?.sonNumber ?? 500;
  const raspberryId = options?.raspberryId ?? 75;
  return {
    raspberryId,
    nomPiste: `rasp ${raspberryId}`,
    ip: `192.168.1.${raspberryId}`,
    startMs,
    endMs: options?.endMs ?? startMs + 1000,
    sonNumber,
    nomFichier: `son${sonNumber}.wav`,
    nomAffiche: `son${sonNumber}`,
    niveau: 75,
    commandeOsc,
  };
}

describe("formaterTempsPiste", () => {
  it("formate 1min40 et 2min41", () => {
    expect(formaterTempsPiste(100_000)).toBe("1min40");
    expect(formaterTempsPiste(161_000)).toBe("2min41");
    expect(formaterTempsPiste(51_000)).toBe("51s");
  });

  it("parse 1min40 et 1:40", () => {
    expect(parserTempsPiste("1min40")).toBe(100_000);
    expect(parserTempsPiste("1:40")).toBe(100_000);
  });
});

describe("construireTexteLogOsc", () => {
  it("affiche le timer, le rasp et la commande", () => {
    const texte = construireTexteLogOsc({
      raspberryId: 75,
      nomPiste: "rasp 75",
      ip: "192.168.1.75",
      startMs: 100_000,
      endMs: 111_000,
      sonNumber: 1,
      nomFichier: "son1.wav",
      nomAffiche: "son1",
      niveau: 75,
      commandeOsc: "/play 1 75",
    });
    expect(texte).toBe("[1min40] Raspberry 75 (192.168.1.75)  /play 1 75");
  });
});

describe("construireTexteLogAttenteComposition", () => {
  it("annonce la pause avant le premier /play", () => {
    expect(construireTexteLogAttenteComposition(1000)).toBe(
      "[preparation] Attente 1 s après /composition avant le premier /play."
    );
  });
});

describe("construireTexteLogStopRegion", () => {
  it("affiche le timer de fin et /stop -1", () => {
    expect(construireTexteLogStopRegion(evenementTest(5000, "/play 500 75", { endMs: 15_000 }))).toBe(
      "[15s] Raspberry 75 (192.168.1.75)  /stop -1"
    );
  });
});

describe("listerRaspberriesEnLigne", () => {
  it("ne garde que les Raspberry connectes", () => {
    expect(
      listerRaspberriesEnLigne([
        { ip: "192.168.1.74", isOnline: true },
        { ip: "192.168.1.75", isOnline: false },
        { ip: "192.168.1.76", isOnline: true },
      ])
    ).toEqual([
      { raspberryId: 74, ip: "192.168.1.74" },
      { raspberryId: 76, ip: "192.168.1.76" },
    ]);
  });
});

describe("garderUnePisteParRaspberry", () => {
  it("ne garde qu'une piste par Raspberry quand il y a des doublons", () => {
    const regions = [
      {
        trackId: 1,
        regionId: 10,
        raspberryId: 74,
        nomPiste: "rasp 74",
        startMs: 0,
        durationMs: 60_000,
        endMs: 60_000,
        sonNumber: null,
        nomFichier: "",
        nomAffiche: "son ?",
      },
      {
        trackId: 2,
        regionId: 20,
        raspberryId: 74,
        nomPiste: "rasp 74",
        startMs: 0,
        durationMs: 2000,
        endMs: 2000,
        sonNumber: 500,
        nomFichier: "son500.wav",
        nomAffiche: "son500",
      },
      {
        trackId: 3,
        regionId: 30,
        raspberryId: 75,
        nomPiste: "rasp 75",
        startMs: 0,
        durationMs: 2000,
        endMs: 2000,
        sonNumber: 500,
        nomFichier: "son500.wav",
        nomAffiche: "son500",
      },
    ];
    const gardees = garderUnePisteParRaspberry(regions);
    expect(gardees).toHaveLength(2);
    expect(gardees.map((region) => region.trackId).sort()).toEqual([2, 3]);
  });
});

describe("lancerLectureSequenceur", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("envoie le premier /play tout de suite s'il n'y a pas de delai", () => {
    const recus: string[] = [];
    lancerLectureSequenceur({
      evenements: [evenementTest(0, "/play 500 75")],
      delaiDemarrageMs: 0,
      onTick: () => undefined,
      onEvenement: (evenement) => {
        recus.push(evenement.commandeOsc);
      },
      onFin: () => undefined,
    });

    vi.advanceTimersByTime(0);
    expect(recus).toEqual(["/play 500 75"]);
  });

  it("n'envoie pas le /play a t=0 tant que le delai composition n'est pas ecoule", () => {
    const recus: string[] = [];
    lancerLectureSequenceur({
      evenements: [evenementTest(0, "/play 500 75")],
      delaiDemarrageMs: DELAI_APRES_COMPOSITION_MS,
      onTick: () => undefined,
      onEvenement: (evenement) => {
        recus.push(evenement.commandeOsc);
      },
      onFin: () => undefined,
    });

    vi.advanceTimersByTime(DELAI_APRES_COMPOSITION_MS - 1);
    expect(recus).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(recus).toEqual(["/play 500 75"]);
  });

  it("conserve l'ecart entre le premier son et le suivant apres la pause", () => {
    const recus: string[] = [];
    lancerLectureSequenceur({
      evenements: [evenementTest(0, "/play 500 75"), evenementTest(200, "/play 501 75")],
      delaiDemarrageMs: DELAI_APRES_COMPOSITION_MS,
      onTick: () => undefined,
      onEvenement: (evenement) => {
        recus.push(evenement.commandeOsc);
      },
      onFin: () => undefined,
    });

    vi.advanceTimersByTime(DELAI_APRES_COMPOSITION_MS);
    expect(recus).toEqual(["/play 500 75"]);
    vi.advanceTimersByTime(200);
    expect(recus).toEqual(["/play 500 75", "/play 501 75"]);
  });

  it("n'appelle onFin qu'apres le dernier evenement", () => {
    let terminee = false;
    lancerLectureSequenceur({
      evenements: [evenementTest(0, "/play 500 75"), evenementTest(200, "/play 501 75")],
      delaiDemarrageMs: DELAI_APRES_COMPOSITION_MS,
      onTick: () => undefined,
      onEvenement: () => undefined,
      onFin: () => {
        terminee = true;
      },
    });

    vi.advanceTimersByTime(DELAI_APRES_COMPOSITION_MS + 199);
    expect(terminee).toBe(false);
    vi.advanceTimersByTime(1 + 400);
    expect(terminee).toBe(true);
  });

  it("arreter annule les /play encore programmes", () => {
    const recus: string[] = [];
    const controle = lancerLectureSequenceur({
      evenements: [evenementTest(0, "/play 500 75"), evenementTest(500, "/play 501 75")],
      delaiDemarrageMs: 0,
      onTick: () => undefined,
      onEvenement: (evenement) => {
        recus.push(evenement.commandeOsc);
      },
      onFin: () => undefined,
    });

    vi.advanceTimersByTime(0);
    expect(recus).toEqual(["/play 500 75"]);
    controle.arreter();
    vi.advanceTimersByTime(2000);
    expect(recus).toEqual(["/play 500 75"]);
  });
});

describe("creerJoueurSequenceur", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function creerHoteTest(commandes: string[]) {
    return {
      envoyerOsc: (evenement: EvenementSequenceurOsc) => {
        commandes.push(evenement.commandeOsc);
        return { ok: true, detail: "" };
      },
      envoyerStop: (evenement: EvenementSequenceurOsc) => {
        commandes.push(`/stop ${evenement.raspberryId}`);
        return { ok: true, detail: "" };
      },
      estLectureActive: () => true,
      onLog: () => undefined,
    };
  }

  it("envoie /stop a la fin de la region avant le /play suivant du meme Raspberry", async () => {
    const commandes: string[] = [];
    const joueur = creerJoueurSequenceur(creerHoteTest(commandes));

    const premier = joueur.jouer(evenementTest(0, "/play 500 75", { sonNumber: 500, endMs: 1000 }));
    await Promise.resolve();
    expect(commandes).toEqual(["/play 500 75"]);

    const second = joueur.jouer(evenementTest(200, "/play 501 75", { sonNumber: 501, endMs: 1200 }));
    await Promise.resolve();
    expect(commandes).toEqual(["/play 500 75"]);

    await vi.advanceTimersByTimeAsync(1000);
    await premier;
    await Promise.resolve();
    expect(commandes).toEqual(["/play 500 75", "/stop 75", "/play 501 75"]);
    await vi.advanceTimersByTimeAsync(1000);
    await second;
    expect(commandes).toEqual(["/play 500 75", "/stop 75", "/play 501 75", "/stop 75"]);
  });

  it("n'attend pas entre deux Raspberry differents", async () => {
    const commandes: string[] = [];
    const joueur = creerJoueurSequenceur({
      envoyerOsc: (evenement) => {
        commandes.push(`rasp${evenement.raspberryId} ${evenement.commandeOsc}`);
        return { ok: true, detail: "" };
      },
      envoyerStop: (evenement) => {
        commandes.push(`rasp${evenement.raspberryId} /stop`);
        return { ok: true, detail: "" };
      },
      estLectureActive: () => true,
      onLog: () => undefined,
    });

    await joueur.jouer(
      evenementTest(0, "/play 500 75", { raspberryId: 74, sonNumber: 500, endMs: 0 })
    );
    await joueur.jouer(
      evenementTest(0, "/play 500 75", { raspberryId: 75, sonNumber: 500, endMs: 0 })
    );
    expect(commandes).toEqual(["rasp74 /play 500 75", "rasp75 /play 500 75"]);
  });

  it("reinitialiser annule le /play encore en file", async () => {
    const commandes: string[] = [];
    let actif = true;
    const joueur = creerJoueurSequenceur({
      ...creerHoteTest(commandes),
      estLectureActive: () => actif,
    });

    const premier = joueur.jouer(evenementTest(0, "/play 500 75", { sonNumber: 500, endMs: 1000 }));
    const second = joueur.jouer(evenementTest(200, "/play 501 75", { sonNumber: 501, endMs: 1200 }));
    await Promise.resolve();
    expect(commandes).toEqual(["/play 500 75"]);

    actif = false;
    joueur.reinitialiser();
    await vi.advanceTimersByTimeAsync(2000);
    await premier;
    await second;
    expect(commandes).toEqual(["/play 500 75"]);
  });
});

describe("reporterNiveauxProgramme", () => {
  it("conserve le niveau saisi quand la piste se met a jour", () => {
    const actuel = [evenementTest(0, "/play 500 90", { sonNumber: 500 })];
    actuel[0]!.niveau = 90;
    const suivant = [evenementTest(0, "/play 500 75", { sonNumber: 500 })];
    reporterNiveauxProgramme(actuel, suivant);
    expect(suivant[0]?.niveau).toBe(90);
    expect(suivant[0]?.commandeOsc).toBe("/play 500 90");
  });

  it("detecte un deplacement de region", () => {
    const avant = [evenementTest(0, "/play 500 75")];
    const apres = [evenementTest(2000, "/play 500 75")];
    expect(signatureProgrammeSequenceur(avant)).not.toBe(signatureProgrammeSequenceur(apres));
  });
});

describe("listerRaspberriesPourStop", () => {
  it("inclut les Raspberry connectes meme s'ils ne sont pas dans le programme", () => {
    const programme = [evenementTest(0, "/play 500 75", { raspberryId: 75 })];
    const cibles = listerRaspberriesPourStop(programme, [
      { raspberryId: 74, ip: "192.168.1.74" },
      { raspberryId: 75, ip: "192.168.1.75" },
    ]);
    expect(cibles.map((item) => item.raspberryId).sort()).toEqual([74, 75]);
  });
});
