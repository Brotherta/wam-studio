import { afterEach, describe, expect, it } from "vitest";
import {
  enregistrerLibelleSon,
  lireLibelleSon,
  lireLibellesSons,
  retirerLibellesSons,
  synchroniserLibellesDepuisFichiers,
} from "../../Services/RaspberryLibellesSonsStore";
import { lireLibelleRenommageOptionnel } from "../../Services/RaspberryEnvoiAudioLotService";

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
  value: { localStorage: stockage },
  configurable: true,
});

afterEach(() => {
  memoire.clear();
});

describe("RaspberryLibellesSonsStore", () => {
  it("ne supprime pas un libelle si la liste de fichiers est incomplete", () => {
    enregistrerLibelleSon("192.168.1.75", "son505.wav", "test 20");
    enregistrerLibelleSon("192.168.1.75", "son506.wav", "couplet");

    const visibles = synchroniserLibellesDepuisFichiers("192.168.1.75", ["son505.wav"]);
    expect(visibles).toEqual({ "son505.wav": "test 20" });
    expect(lireLibellesSons("192.168.1.75")).toEqual({
      "son505.wav": "test 20",
      "son506.wav": "couplet",
    });
  });

  it("garde le nom du 2e envoi apres un listing qui n'a pas encore le nouveau fichier", () => {
    enregistrerLibelleSon("192.168.1.75", "son505.wav", "test11");
    synchroniserLibellesDepuisFichiers("192.168.1.75", ["son505.wav"]);

    enregistrerLibelleSon("192.168.1.75", "son506.wav", "test 20");
    synchroniserLibellesDepuisFichiers("192.168.1.75", ["son505.wav"]);

    expect(lireLibellesSons("192.168.1.75")["son506.wav"]).toBe("test 20");
    expect(
      synchroniserLibellesDepuisFichiers("192.168.1.75", ["son505.wav", "son506.wav"])
    ).toEqual({
      "son505.wav": "test11",
      "son506.wav": "test 20",
    });
  });

  it("retire un libelle seulement a la suppression", () => {
    enregistrerLibelleSon("192.168.1.75", "son505.wav", "test11");
    retirerLibellesSons("192.168.1.75", ["son505.wav"]);
    expect(lireLibellesSons("192.168.1.75")).toEqual({});
  });

  it("retrouve le nom choisi a partir du fichier", () => {
    enregistrerLibelleSon("192.168.1.75", "son520.wav", "test11");
    expect(lireLibelleSon("192.168.1.75", "son520.wav")).toBe("test11");
  });
});

describe("lireLibelleRenommageOptionnel", () => {
  it("conserve le nom saisi, y compris les espaces", () => {
    expect(
      lireLibelleRenommageOptionnel(
        { decoupage: true, renommage: true, nomsSons: ["test 20", "", "  "] },
        0
      )
    ).toBe("test 20");
    expect(
      lireLibelleRenommageOptionnel(
        { decoupage: true, renommage: true, nomsSons: ["test 20", "", "  "] },
        1
      )
    ).toBeUndefined();
  });
});
