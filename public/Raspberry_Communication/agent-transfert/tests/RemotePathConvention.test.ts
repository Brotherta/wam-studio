import { describe, expect, it } from "vitest";
import {
  construireCheminDistantFinal,
  construireCheminDistantPart,
  construireNomFichierDistant,
  REMOTE_SONS_DIRECTORY,
  SON_NUMERO_WAM_DEFAUT,
  resoudreCheminsDistant,
  validerEtNormaliserCheminDistant,
} from "../src/config/RemotePathConvention";

describe("RemotePathConvention", () => {
  it("construit le dossier skini/sons sur le Pi", () => {
    expect(REMOTE_SONS_DIRECTORY).toBe("/home/pi/modulePre/PureData/compositions/skini/sons");
  });

  it("reserve le numero 500 aux sons WAM", () => {
    expect(SON_NUMERO_WAM_DEFAUT).toBe(500);
  });

  it("refuse d'ecraser les sons Skini 1-499", () => {
    expect(() =>
      construireNomFichierDistant({ raspberryId: 74, sonNumber: 1, extension: ".wav" })
    ).toThrow(/500/);
  });

  it("nomme un son unique son500.wav", () => {
    expect(
      construireNomFichierDistant({ raspberryId: 74, sonNumber: 500, extension: ".wav" })
    ).toBe("son500.wav");
  });

  it("nomme les variantes d'une meme piste", () => {
    expect(
      construireNomFichierDistant({ raspberryId: 75, sonNumber: 500, varianteIndex: 1, extension: "mp3" })
    ).toBe("son500-1.mp3");
    expect(
      construireNomFichierDistant({ raspberryId: 75, sonNumber: 500, varianteIndex: 2, extension: "mp3" })
    ).toBe("son500-2.mp3");
  });

  it("utilise .part pendant le SCP puis le chemin final dans sons/", () => {
    const nom = "son500.wav";
    expect(construireCheminDistantPart(nom)).toBe(
      "/home/pi/modulePre/PureData/compositions/skini/sons/son500.wav.part"
    );
    expect(construireCheminDistantFinal(nom)).toBe(
      "/home/pi/modulePre/PureData/compositions/skini/sons/son500.wav"
    );
  });

  it("accepte un chemin distant personnalise", () => {
    const chemin = "/home/pi/mon-dossier/test.wav";
    expect(validerEtNormaliserCheminDistant(chemin)).toBe(chemin);
    const chemins = resoudreCheminsDistant({ extension: ".wav", remotePath: chemin });
    expect(chemins.remotePathFinal).toBe(chemin);
    expect(chemins.remotePathPart).toBe("/home/pi/mon-dossier/test.wav.part");
    expect(chemins.remoteDirectory).toBe("/home/pi/mon-dossier");
    expect(chemins.remoteFilename).toBe("test.wav");
  });
});
