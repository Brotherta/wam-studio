import { describe, expect, it } from "vitest";
import {
  estNomFichierAudioAutorise,
  filtrerNomsFichiersAudioAutorises,
} from "../src/utils/validerNomFichierAudio";

describe("validerNomFichierAudio", () => {
  it("accepte les noms audio simples", () => {
    expect(estNomFichierAudioAutorise("son500.wav")).toBe(true);
    expect(estNomFichierAudioAutorise("daylight.wav")).toBe(true);
  });

  it("refuse les chemins ou noms dangereux", () => {
    expect(estNomFichierAudioAutorise("../son500.wav")).toBe(false);
    expect(estNomFichierAudioAutorise("sons/son500.wav")).toBe(false);
    expect(estNomFichierAudioAutorise(".hidden.wav")).toBe(false);
    expect(estNomFichierAudioAutorise("son500.part")).toBe(false);
  });

  it("deduplique et filtre une liste", () => {
    expect(
      filtrerNomsFichiersAudioAutorises(["son500.wav", "son500.wav", "../hack.wav", "intro.mp3"])
    ).toEqual(["son500.wav", "intro.mp3"]);
  });
});
