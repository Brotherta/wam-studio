import { describe, expect, it } from "vitest";
import { formaterErreurSsh } from "../src/utils/erreurSsh";

describe("formaterErreurSsh", () => {
  it("remplace le message generique Failure par un libelle SFTP", () => {
    const erreur = formaterErreurSsh(new Error("Failure"), {
      operation: "envoi du fichier",
      cheminDistant:
        "/home/pi/modulePre/PureData/compositions/skini/sons/son500.wav",
    });
    expect(erreur.message).toContain("envoi du fichier");
    expect(erreur.message).toContain("son500.wav");
    expect(erreur.message).not.toBe("Failure");
    expect(erreur.message.toLowerCase()).toContain("echec sftp");
  });

  it("detaille le code SFTP permission refusee", () => {
    const erreur = formaterErreurSsh(Object.assign(new Error("Failure"), { code: 3 }), {
      operation: "creation du dossier distant",
      dossierDistant:
        "/home/pi/modulePre/PureData/compositions/skini/sons",
    });
    expect(erreur.message).toContain("permission refusee");
    expect(erreur.message).toContain("pi/raspberry");
  });

  it("detaille une erreur d'authentification SSH", () => {
    const erreur = formaterErreurSsh(
      new Error("All configured authentication methods failed"),
      {
        operation: "connexion SSH",
        hote: "pi@192.168.1.75:22",
      }
    );
    expect(erreur.message).toContain("authentification SSH refusee");
    expect(erreur.message).toContain("pi@192.168.1.75:22");
  });
});
