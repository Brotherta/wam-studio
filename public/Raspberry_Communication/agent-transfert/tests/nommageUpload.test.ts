import { describe, expect, it } from "vitest";
import {
  lireNommageDepuisEntetesUpload,
  resoudreCheminsDepuisNommageUpload,
  resoudreNomFichierStocke,
} from "../src/utils/nommageUpload";

describe("nommageUpload", () => {
  it("lit les en-tetes de nommage", () => {
    const nommage = lireNommageDepuisEntetesUpload({
      "x-raspberry-id": "75",
      "x-son-number": "501",
      "x-variante-index": "1",
    });
    expect(nommage).toEqual({ raspberryId: 75, sonNumber: 501, varianteIndex: 1 });
  });

  it("renomme le fichier stocke selon la convention skini", () => {
    const nommage = { raspberryId: 75, sonNumber: 500 };
    expect(resoudreNomFichierStocke(nommage, "ma-boucle.wav")).toBe("son500.wav");
  });

  it("resout le chemin distant des l'upload", () => {
    const { nomFichierStocke, chemins } = resoudreCheminsDepuisNommageUpload(
      { raspberryId: 75, sonNumber: 501 },
      "test.mp3"
    );
    expect(nomFichierStocke).toBe("son501.mp3");
    expect(chemins.remotePathFinal).toBe(
      "/home/pi/modulePre/PureData/compositions/skini/sons/son501.mp3"
    );
  });
});
