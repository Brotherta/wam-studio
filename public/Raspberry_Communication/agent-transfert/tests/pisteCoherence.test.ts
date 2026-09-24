import { describe, expect, it } from "vitest";
import {
  bindingCibleLeRaspberry,
  liaisonPisteEstCoherente,
} from "../../Services/RaspberryPisteCoherence";

describe("liaisonPisteEstCoherente", () => {
  it("accepte IP .74 avec raspberry 74 et piste rasp 74", () => {
    expect(
      liaisonPisteEstCoherente({
        raspberryIp: "192.168.1.74",
        raspberryId: 74,
        nomPiste: "rasp 74",
      })
    ).toBe(true);
  });

  it("refuse d'associer le Pi 74 a la piste 75", () => {
    expect(
      liaisonPisteEstCoherente({
        raspberryIp: "192.168.1.74",
        raspberryId: 75,
        nomPiste: "rasp 75",
      })
    ).toBe(false);
    expect(
      liaisonPisteEstCoherente({
        raspberryIp: "192.168.1.75",
        raspberryId: 74,
        nomPiste: "rasp 74",
      })
    ).toBe(false);
  });
});

describe("bindingCibleLeRaspberry", () => {
  it("refuse un binding 75 utilise pour envoyer vers le 74", () => {
    expect(
      bindingCibleLeRaspberry(
        { raspberryIp: "192.168.1.75", raspberryId: 75 },
        "192.168.1.74",
        74
      )
    ).toBe(false);
  });

  it("accepte le binding du meme Raspberry", () => {
    expect(
      bindingCibleLeRaspberry(
        { raspberryIp: "192.168.1.74", raspberryId: 74 },
        "192.168.1.74",
        74
      )
    ).toBe(true);
  });
});
