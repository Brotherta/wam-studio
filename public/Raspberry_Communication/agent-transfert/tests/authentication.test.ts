import { describe, expect, it } from "vitest";
import { creerAuthentificationDepuisCommande } from "../src/auth/AuthenticationProvider";
import { PasswordAuthenticationProvider } from "../src/auth/PasswordAuthenticationProvider";
import { PrivateKeyAuthenticationProvider } from "../src/auth/PrivateKeyAuthenticationProvider";

describe("creerAuthentificationDepuisCommande", () => {
  it("choisit le mode mot de passe si sshPassword est fourni", () => {
    const provider = creerAuthentificationDepuisCommande(
      {
        type: "startTransfer",
        transferId: "x",
        raspberryId: 1,
        sonNumber: 1,
        sshHost: "192.168.1.74",
        sshPassword: "secret",
      },
      {}
    );
    expect(provider).toBeInstanceOf(PasswordAuthenticationProvider);
  });

  it("choisit la cle privee depuis la config locale", () => {
    const provider = creerAuthentificationDepuisCommande(
      {
        type: "startTransfer",
        transferId: "x",
        raspberryId: 1,
        sonNumber: 1,
        sshHost: "192.168.1.74",
      },
      { privateKeyPath: "C:/Users/test/.ssh/id_rsa" }
    );
    expect(provider).toBeInstanceOf(PrivateKeyAuthenticationProvider);
  });

  it("refuse si aucune methode d'authentification n'est disponible", () => {
    expect(() =>
      creerAuthentificationDepuisCommande(
        {
          type: "startTransfer",
          transferId: "x",
          raspberryId: 1,
          sonNumber: 1,
          sshHost: "192.168.1.74",
        },
        {}
      )
    ).toThrow(/authentification/i);
  });
});
