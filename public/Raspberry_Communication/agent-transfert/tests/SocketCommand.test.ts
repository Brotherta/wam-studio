import { describe, expect, it } from "vitest";
import { analyserCommandeSocket, fusionnerCibleSsh } from "../src/models/SocketCommand";

describe("analyserCommandeSocket", () => {
  it("accepte startTransfer avec metadonnees", () => {
    const resultat = analyserCommandeSocket({
      type: "startTransfer",
      transferId: "abc",
      raspberryId: 74,
      sonNumber: 501,
      varianteIndex: 1,
    });
    expect(resultat.ok).toBe(true);
    if (resultat.ok) {
      expect(resultat.commande).toEqual({
        type: "startTransfer",
        transferId: "abc",
        raspberryId: 74,
        sonNumber: 501,
        varianteIndex: 1,
      });
    }
  });

  it("refuse startTransfer sans raspberryId", () => {
    const resultat = analyserCommandeSocket({
      type: "startTransfer",
      transferId: "abc",
      sonNumber: 1,
    });
    expect(resultat.ok).toBe(false);
  });

  it("accepte subscribe et cancelTransfer", () => {
    expect(analyserCommandeSocket({ type: "subscribe", transferId: "x" }).ok).toBe(true);
    expect(analyserCommandeSocket({ type: "cancelTransfer", transferId: "x" }).ok).toBe(true);
  });
});

describe("fusionnerCibleSsh", () => {
  it("utilise la config locale en secours", () => {
    const cible = fusionnerCibleSsh(
      { type: "startTransfer", transferId: "a", raspberryId: 1, sonNumber: 1 },
      { sshHost: "192.168.1.74", sshPort: 22, sshLogin: "pi" }
    );
    expect(cible).toEqual({ host: "192.168.1.74", port: 22, username: "pi" });
  });

  it("exige une adresse SSH", () => {
    expect(() =>
      fusionnerCibleSsh(
        { type: "startTransfer", transferId: "a", raspberryId: 1, sonNumber: 1 },
        {}
      )
    ).toThrow(/SSH/);
  });
});
