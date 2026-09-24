import { describe, expect, it } from "vitest";
import { formaterNomAfficheSon } from "../../utils/osc/NomSonPiste";

describe("formaterNomAfficheSon", () => {
  it("affiche son520 (test11) quand un nom a ete choisi", () => {
    expect(
      formaterNomAfficheSon("son520.wav", { libelle: "test11", sonNumber: 520 })
    ).toBe("son520 (test11)");
  });

  it("n'ajoute pas de parenthese s'il n'y a pas de nom choisi", () => {
    expect(formaterNomAfficheSon("son520.wav", { sonNumber: 520 })).toBe("son520");
  });

  it("ne double pas les parentheses si le nom est deja formate", () => {
    expect(
      formaterNomAfficheSon("son520.wav", {
        libelle: "son520 (test11)",
        sonNumber: 520,
      })
    ).toBe("son520 (test11)");
  });

  it("reconstruit le format a partir d'un ancien libelle seul", () => {
    expect(
      formaterNomAfficheSon("son520.wav", { libelle: "test11", sonNumber: 520 })
    ).toBe("son520 (test11)");
  });
});
