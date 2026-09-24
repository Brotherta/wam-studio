import { describe, expect, it } from "vitest";
import {
  construireCommandeStartTransfer,
  construireEntetesUploadNommage,
  formatOctets,
  formatTexteProgression,
  formatTempsRestant,
  validerFormulaire,
} from "../public/test-client/helpers.js";

describe("transferId", () => {
  it("accepte un UUID v4 dans l'entete", async () => {
    const { estUuidV4, resoudreTransferIdDepuisEntete } = await import("../src/utils/transferId");
    const id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    expect(estUuidV4(id)).toBe(true);
    expect(resoudreTransferIdDepuisEntete(id)).toBe(id);
  });

  it("genere un nouvel id si l'entete est invalide", async () => {
    const { resoudreTransferIdDepuisEntete } = await import("../src/utils/transferId");
    const id = resoudreTransferIdDepuisEntete("pas-un-uuid");
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });
});

describe("client helpers", () => {
  it("formate les octets et le temps restant", () => {
    expect(formatOctets(512)).toBe("512 o");
    expect(formatOctets(2048)).toContain("Ko");
    expect(formatTempsRestant(125)).toBe("~2m 5s");
  });

  it("formate une progression complete", () => {
    const texte = formatTexteProgression({
      current: 50,
      total: 100,
      percent: 50,
      speed: 2.5,
      remainingSeconds: 10,
    });
    expect(texte).toContain("50%");
    expect(texte).toContain("2.50 Mo/s");
  });

  it("valide le formulaire et construit startTransfer", () => {
    const formulaire = {
      authMode: "key",
      sshHost: "192.168.1.74",
      sshPort: 22,
      sshUsername: "pi",
      privateKeyPath: "C:/keys/id_rsa",
      passphrase: "",
      sshPassword: "",
      raspberryId: 74,
      sonNumber: 501,
    };
    const fichier = { name: "son.wav" };
    expect(validerFormulaire(formulaire, fichier).ok).toBe(true);

    const commande = construireCommandeStartTransfer(formulaire, "tid-1");
    expect(commande.type).toBe("startTransfer");
    expect(commande.transferId).toBe("tid-1");
    expect(commande.privateKeyPath).toBe("C:/keys/id_rsa");
    expect(commande.remotePath).toBeUndefined();
  });

  it("construit les en-tetes d'upload avec nommage", () => {
    const entetes = construireEntetesUploadNommage(
      { raspberryId: 74, sonNumber: 501 },
      "tid-1"
    );
    expect(entetes["X-Raspberry-Id"]).toBe("74");
    expect(entetes["X-Son-Number"]).toBe("501");
  });

  it("refuse un envoi sans fichier", () => {
    const resultat = validerFormulaire(
      {
        authMode: "password",
        sshHost: "10.0.0.1",
        sshPort: 22,
        sshUsername: "pi",
        privateKeyPath: "",
        passphrase: "",
        sshPassword: "secret",
        raspberryId: 1,
        sonNumber: 1,
      },
      null
    );
    expect(resultat.ok).toBe(false);
  });
});
