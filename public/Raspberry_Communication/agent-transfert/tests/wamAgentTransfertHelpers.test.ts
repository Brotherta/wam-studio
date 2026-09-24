import { describe, expect, it } from "vitest";

import {

  apercuCheminComplet,

  CHEMIN_SONS_SKINI_PI,

  construireCommandeStartTransfer,

  construireEntetesUploadNommage,

  extraireNumeroRaspberryDepuisIp,
  lireNumeroRaspberryDepuisNomPiste,
  lireNumeroRaspberryDepuisElementPiste,
  formaterNomPisteRaspberry,
  formaterPrefixeFichierRaspberry,
  nomsPisteCorrespondentAuRaspberry,
  sanitiserNomSon,
  validerNomSonObligatoire,
  construireNomFichierDistant,

  formatOctets,

  formaterTexteErreurTransfert,

  MOT_DE_PASSE_SSH_PI,

  validerFormulaireTransfert,

  type TransfertFormulaire,

} from "../../utils/agent-transfert/AgentTransfertHelpers";
import { extraireNumeroSonOscDepuisFichier, formaterLibelleFichierPlay, lireNiveauPlay, OSC_PLAY_NIVEAU_DEFAUT } from "../../utils/osc/OscPlayHelpers";



describe("AgentTransfertHelpers (client WAM)", () => {

  it("deduit le numero Raspberry depuis l'IP", () => {

    expect(extraireNumeroRaspberryDepuisIp("192.168.1.74")).toBe(74);

    expect(extraireNumeroRaspberryDepuisIp("invalid")).toBeUndefined();

  });

  it("formate le nom piste et le prefixe fichier Raspberry", () => {
    expect(formaterNomPisteRaspberry(75)).toBe("rasp 75");
    expect(formaterPrefixeFichierRaspberry(75)).toBe("rasp75");
  });

  it("lit le numero Raspberry depuis le nom de piste WAM", () => {
    expect(lireNumeroRaspberryDepuisNomPiste("rasp 75")).toBe(75);
    expect(lireNumeroRaspberryDepuisNomPiste("rasp75")).toBe(75);
    expect(lireNumeroRaspberryDepuisNomPiste("Rasp 3")).toBe(3);
    expect(lireNumeroRaspberryDepuisNomPiste("Basse")).toBeUndefined();
    expect(nomsPisteCorrespondentAuRaspberry("rasp 74", 74)).toBe(true);
    expect(nomsPisteCorrespondentAuRaspberry("rasp 75", 74)).toBe(false);
  });

  it("retrouve le numero Raspberry depuis le champ nom ou l'attribut de liaison", () => {
    expect(
      lireNumeroRaspberryDepuisElementPiste({ name: "Track 3", trackNameInput: { value: "rasp 74" } })
    ).toBe(74);
    expect(
      lireNumeroRaspberryDepuisElementPiste({
        name: "NEW TRACK",
        getAttribute: (nom) => (nom === "data-raspberry-lie" ? "75" : null),
      })
    ).toBe(75);
    expect(lireNumeroRaspberryDepuisElementPiste({ name: "Basse" })).toBeUndefined();
  });



  it("formate les octets", () => {

    expect(formatOctets(2048)).toContain("Ko");

  });



  it("valide un formulaire minimal", () => {

    const formulaire: TransfertFormulaire = {
      sshHost: "192.168.1.74",
      sshPort: 22,
      sshUsername: "pi",
      raspberryId: 74,
    };

    expect(validerFormulaireTransfert(formulaire, { name: "son.wav" } as File).ok).toBe(true);

  });



  it("construit les en-tetes d'upload avec nommage skini", () => {
    const entetes = construireEntetesUploadNommage(
      { raspberryId: 75, sonNumber: 2, varianteIndex: 1 },
      "uuid-test"
    );
    expect(entetes["X-Transfer-Id"]).toBe("uuid-test");
    expect(entetes["X-Raspberry-Id"]).toBe("75");
    expect(entetes["X-Son-Number"]).toBe("500");
  });

  it("construit startTransfer avec mot de passe par defaut", () => {
    const formulaire: TransfertFormulaire = {
      sshHost: "192.168.1.74",
      sshPort: 22,
      sshUsername: "pi",
      raspberryId: 74,
    };

    const cmd = construireCommandeStartTransfer(formulaire, "uuid-test");

    expect(cmd.remotePath).toBe(
      "/home/pi/modulePre/PureData/compositions/skini/sons/son500.wav"
    );
    expect(cmd.sonNumber).toBe(500);
    expect(cmd.authMode).toBe("password");
    expect(cmd.sshPassword).toBe(MOT_DE_PASSE_SSH_PI);
    expect(cmd.type).toBe("startTransfer");
  });



  it("apercu chemin skini", () => {

    expect(CHEMIN_SONS_SKINI_PI).toBe(
      "/home/pi/modulePre/PureData/compositions/skini/sons"
    );

    expect(

      apercuCheminComplet({ raspberryId: 74, sonNumber: 500 }, "test.mp3")

    ).toBe("/home/pi/modulePre/PureData/compositions/skini/sons/son500.mp3");

  });

  it("sanitise un nom de son libre", () => {
    expect(sanitiserNomSon("Mon Intro !")).toBe("mon-intro");
    expect(validerNomSonObligatoire("   ").ok).toBe(false);
    expect(
      construireNomFichierDistant(
        { raspberryId: 75, sonNumber: 500, nomSon: "Intro" },
        "export.wav"
      )
    ).toBe("son500.wav");
    expect(
      construireNomFichierDistant(
        { raspberryId: 75, sonNumber: 502, nomFichierDistant: "believer.wav" },
        "export.wav"
      )
    ).toBe("son502.wav");
    expect(
      construireNomFichierDistant(
        { raspberryId: 75, sonNumber: 502, nomFichierDistant: "son502.wav" },
        "export.wav"
      )
    ).toBe("son502.wav");
  });

  it("extrait le numero OSC uniquement depuis un nom Skini jouable", () => {
    expect(extraireNumeroSonOscDepuisFichier("son500.wav")).toBe(500);
    expect(extraireNumeroSonOscDepuisFichier("son500-1.wav")).toBe(500);
    expect(extraireNumeroSonOscDepuisFichier("daylight.wav")).toBeNull();
    expect(extraireNumeroSonOscDepuisFichier("believer.wav")).toBeNull();
  });

  it("affiche le nom personnalise avec le fichier, sinon seulement le nom du son", () => {
    expect(formaterLibelleFichierPlay("son502.wav", { "son502.wav": "daylight" })).toBe(
      "daylight — son502.wav"
    );
    expect(formaterLibelleFichierPlay("son505.wav", { "son505.wav": "test 20" })).toBe(
      "test 20 — son505.wav"
    );
    expect(formaterLibelleFichierPlay("son500.wav")).toBe("son500");
    expect(formaterLibelleFichierPlay("daylight.wav")).toBe("daylight");
  });

  it("borne le niveau OSC entre 0 et 127", () => {
    expect(OSC_PLAY_NIVEAU_DEFAUT).toBe(75);
    expect(lireNiveauPlay("")).toBe(75);
    expect(lireNiveauPlay("75")).toBe(75);
    expect(lireNiveauPlay("200")).toBe(127);
    expect(lireNiveauPlay("-3")).toBe(0);
  });

  it("formate un message d'erreur sans duplication", () => {
    const message = formaterTexteErreurTransfert(
      "Erreur: Erreur: Echec creation du dossier distant : permission refusee"
    );
    expect(message).toBe(
      "Erreur: Echec creation du dossier distant : permission refusee\n\nVous pouvez reessayer avec un autre fichier."
    );
    expect(message.match(/Erreur:/g)?.length).toBe(1);
    expect(message.match(/Vous pouvez reessayer/g)?.length).toBe(1);
  });

});

