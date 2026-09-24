import { describe, expect, it } from "vitest";
import { parserAdresseOscPersonnalisee } from "../../Services/RaspberryMarqueursSequenceur";
import {
  MODELES_COMMANDES_OSC_MARQUEUR,
  composerCommandeOscDepuisModele,
  composerCommandeOscMarqueur,
  decouperValeurOsc,
  infererIdCommandeOsc,
  texteEtiquetteMarqueur,
} from "../../utils/osc/CommandesOscMarqueur";

describe("composerCommandeOscMarqueur", () => {
  it("prefill les 6 commandes du menu", () => {
    const parId = Object.fromEntries(
      MODELES_COMMANDES_OSC_MARQUEUR.map((modele) => [
        modele.id,
        composerCommandeOscDepuisModele(modele).apercu,
      ])
    );
    expect(parId).toEqual({
      play: "/play 1 90",
      stop: "/stop 1",
      "stop-all": "/stop -1",
      level: "/level 90",
      loop: "/loop 1 1",
      attenuation: "/attenuation 1 90",
    });
  });

  it("laisse l'utilisateur modifier tous les emplacements, y compris le fade", () => {
    expect(composerCommandeOscMarqueur("/stop", ["1", "4000"]).apercu).toBe("/stop 1 4000");
    expect(composerCommandeOscMarqueur("/loop", ["3", "0"]).apercu).toBe("/loop 3 0");
    expect(composerCommandeOscMarqueur("/play", ["2", "200"]).apercu).toBe("/play 2 200");
    expect(composerCommandeOscMarqueur("/play", ["2", "200"]).valeur).toBe("2 200");
  });

  it("ignore les emplacements vides", () => {
    expect(composerCommandeOscMarqueur("/stop", ["1", ""]).apercu).toBe("/stop 1");
    expect(composerCommandeOscMarqueur("/level", ["  80  "]).valeur).toBe("80");
  });

  it("expose play, stop, stop all, level, loop, attenuation", () => {
    expect(MODELES_COMMANDES_OSC_MARQUEUR.map((modele) => modele.libelleMenu)).toEqual([
      "play",
      "stop",
      "stop all",
      "level",
      "loop",
      "attenuation",
    ]);
  });

  it("reste compatible avec l'envoi OSC (adresse / arguments)", () => {
    for (const modele of MODELES_COMMANDES_OSC_MARQUEUR) {
      const commande = composerCommandeOscDepuisModele(modele);
      expect(parserAdresseOscPersonnalisee(commande.adresse, commande.valeur)).toEqual({
        message: commande.adresse,
        value: commande.valeur,
      });
    }
  });

  it("decoupe et infere une commande deja posee", () => {
    expect(infererIdCommandeOsc("/level", "0")).toBe("level");
    expect(infererIdCommandeOsc("/stop", "-1")).toBe("stop-all");
    expect(infererIdCommandeOsc("/stop", "1 4000")).toBe("stop");
    expect(decouperValeurOsc("0", 1)).toEqual(["0"]);
    expect(decouperValeurOsc("1 4000", 2)).toEqual(["1", "4000"]);
    expect(
      texteEtiquetteMarqueur({
        type: "osc",
        libelle: "Level",
        oscAdresse: "/level",
        oscValeur: "0",
      })
    ).toBe("/level 0");
  });
});
