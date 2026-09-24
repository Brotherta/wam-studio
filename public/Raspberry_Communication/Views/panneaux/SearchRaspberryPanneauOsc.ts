import Raspberry from "../../Models/Raspberry";
import type { OscDraft } from "../../Models/SearchRaspberryState";
import { estCommandePlay, OSC_PLAY_ARGUMENTS_DEFAUT, OSC_PLAY_NIVEAU_DEFAUT } from "../../utils/osc/OscPlayHelpers";
import { creerLigneGrilleOsc } from "./SearchRaspberryPanneauOscDom";
import { ajouterChampsPlayAuFormulaire } from "./SearchRaspberryPanneauOscPlay";

export type HotePanneauOsc = {
  oscDraftByIp: Map<string, OscDraft>;
  oscLastStatusByIp: Map<string, { ok: boolean; text: string; atMs: number }>;
  sendMessage: (message: Record<string, unknown> & { type: string }) => boolean;
  listerFichiersSonSurPi?: (
    ip: string
  ) => Promise<
    | { ok: true; fichiers: string[]; remoteDirectory: string }
    | { ok: false; error: string }
  >;
};

function creerChampTexte(placeholder: string, valeur: string): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  input.value = valeur;
  input.style.width = "100%";
  return input;
}

function creerChampNombre(placeholder: string, valeur: string): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "number";
  input.placeholder = placeholder;
  input.value = valeur;
  input.min = "1";
  input.max = "65535";
  input.style.width = "140px";
  return input;
}

function creerBoutonRapide(texte: string, actif: boolean): HTMLButtonElement {
  const bouton = document.createElement("button");
  bouton.innerText = texte;
  bouton.className = "btn btn-sm btn-secondary";
  bouton.disabled = !actif;
  return bouton;
}

/** Formulaire OSC affiché dans le panneau détails d’un Raspberry. */
export function construirePanneauOsc(hote: HotePanneauOsc, raspberry: Raspberry): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.style.marginTop = "12px";
  wrapper.style.paddingTop = "10px";
  wrapper.style.borderTop = "1px solid #2f363d";

  const title = document.createElement("div");
  title.innerHTML = "<strong>Commande OSC</strong>";
  wrapper.appendChild(title);

  const draft = hote.oscDraftByIp.get(raspberry.ip);

  const form = document.createElement("div");
  form.style.display = "grid";
  form.style.gridTemplateColumns = "110px 1fr";
  form.style.gap = "6px 10px";
  form.style.marginTop = "8px";

  const addrInput = creerChampTexte("/play", draft ? draft.address : "/play");
  const argsInput = creerChampTexte(`ex: ${OSC_PLAY_ARGUMENTS_DEFAUT}`, draft?.args || OSC_PLAY_ARGUMENTS_DEFAUT);
  const portInput = creerChampNombre("4000", draft ? draft.port : "4000");

  form.appendChild(creerLigneGrilleOsc("Adresse", addrInput));
  const champsPlay = ajouterChampsPlayAuFormulaire(form, raspberry, hote, draft, argsInput);
  const ligneArguments = creerLigneGrilleOsc("Arguments", argsInput);
  form.appendChild(ligneArguments);
  form.appendChild(creerLigneGrilleOsc("Port UDP", portInput));
  wrapper.appendChild(form);

  const sendBtn = document.createElement("button");
  sendBtn.innerText = "Envoyer";
  sendBtn.className = "btn btn-sm btn-primary";
  sendBtn.disabled = !raspberry.isOnline;

  const quickPlay = creerBoutonRapide(`/play ${OSC_PLAY_ARGUMENTS_DEFAUT}`, raspberry.isOnline);
  const quickComposition = creerBoutonRapide("/composition 1", raspberry.isOnline);
  const quickLevel = creerBoutonRapide(`/level ${OSC_PLAY_NIVEAU_DEFAUT}`, raspberry.isOnline);
  const quickStopAll = creerBoutonRapide("/stop -1", raspberry.isOnline);

  const buttonsRow = document.createElement("div");
  buttonsRow.style.display = "flex";
  buttonsRow.style.gap = "8px";
  buttonsRow.style.marginTop = "10px";
  buttonsRow.style.flexWrap = "wrap";
  buttonsRow.appendChild(sendBtn);
  buttonsRow.appendChild(quickPlay);
  buttonsRow.appendChild(quickComposition);
  buttonsRow.appendChild(quickLevel);
  buttonsRow.appendChild(quickStopAll);
  wrapper.appendChild(buttonsRow);

  const status = creerZoneStatutOsc(hote, raspberry);
  wrapper.appendChild(status);

  const enregistrerBrouillon = () => {
    const etatPlay = champsPlay.lireEtat();
    hote.oscDraftByIp.set(raspberry.ip, {
      address: addrInput.value,
      args: argsInput.value,
      port: portInput.value,
      playFichier: etatPlay.playFichier,
      playSonNumber: etatPlay.playSonNumber,
      playLevel: etatPlay.playLevel,
    });
  };

  const appliquerVisibiliteCommande = () => {
    const play = estCommandePlay(addrInput.value);
    champsPlay.afficher(play);
    if (play) {
      champsPlay.synchroniserArguments(argsInput);
    }
    enregistrerBrouillon();
  };

  const doSend = async () => {
    await envoyerCommandeOsc({
      hote,
      raspberry,
      adresse: addrInput.value,
      valeur: argsInput.value,
      port: portInput.value,
      status,
      enregistrerBrouillon,
      champsPlay,
      sendBtn,
      argsInput,
    });
  };

  quickPlay.addEventListener("click", () => {
    addrInput.value = "/play";
    argsInput.value = OSC_PLAY_ARGUMENTS_DEFAUT;
    appliquerVisibiliteCommande();
  });
  quickStopAll.addEventListener("click", () => {
    addrInput.value = "/stop";
    argsInput.value = "-1";
    appliquerVisibiliteCommande();
  });
  quickLevel.addEventListener("click", () => {
    addrInput.value = "/level";
    argsInput.value = String(OSC_PLAY_NIVEAU_DEFAUT);
    appliquerVisibiliteCommande();
  });
  quickComposition.addEventListener("click", () => {
    addrInput.value = "/composition";
    argsInput.value = "1";
    appliquerVisibiliteCommande();
  });

  sendBtn.addEventListener("click", () => {
    void doSend();
  });
  addrInput.addEventListener("input", appliquerVisibiliteCommande);
  argsInput.addEventListener("input", enregistrerBrouillon);
  portInput.addEventListener("input", enregistrerBrouillon);
  addrInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void doSend();
    }
  });
  argsInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void doSend();
    }
  });

  appliquerVisibiliteCommande();
  return wrapper;
}

function creerZoneStatutOsc(hote: HotePanneauOsc, raspberry: Raspberry): HTMLDivElement {
  const status = document.createElement("div");
  status.style.marginTop = "10px";
  status.style.padding = "8px";
  status.style.borderRadius = "8px";
  status.style.border = "1px solid #2f363d";
  status.style.backgroundColor = "#12181d";
  status.style.fontFamily = "monospace";
  status.style.fontSize = "12px";
  status.style.whiteSpace = "pre-wrap";
  status.style.wordBreak = "break-word";
  status.setAttribute("data-osc-status", "1");

  const last = hote.oscLastStatusByIp.get(raspberry.ip);
  if (last) {
    status.style.borderColor = last.ok ? "#1f8b4c" : "#a53333";
    status.innerText = last.text;
    return status;
  }

  status.style.opacity = "0.85";
  status.innerText = raspberry.isOnline
    ? "Aucun envoi OSC effectue pour ce Raspberry."
    : "Raspberry hors ligne: envoi OSC desactive.";
  return status;
}

function afficherStatutOsc(
  hote: HotePanneauOsc,
  raspberry: Raspberry,
  status: HTMLDivElement,
  ok: boolean,
  text: string
): void {
  hote.oscLastStatusByIp.set(raspberry.ip, { ok, atMs: Date.now(), text });
  status.style.borderColor = ok ? "#3b4046" : "#a53333";
  status.style.opacity = "1";
  status.innerText = text;
}

function envoyerCommandeOsc(params: {
  hote: HotePanneauOsc;
  raspberry: Raspberry;
  adresse: string;
  valeur: string;
  port: string;
  status: HTMLDivElement;
  enregistrerBrouillon: () => void;
  champsPlay: import("./SearchRaspberryPanneauOscPlay").ControleChampsPlayOsc;
  sendBtn: HTMLButtonElement;
  argsInput: HTMLInputElement;
}): Promise<void> {
  const {
    hote,
    raspberry,
    adresse,
    valeur,
    port,
    status,
    enregistrerBrouillon,
    champsPlay,
    sendBtn,
    argsInput,
  } = params;

  const executer = async () => {
    if (!raspberry.isOnline) {
      return;
    }
    enregistrerBrouillon();

    const rawAddress = adresse.trim();
    const adresseOsc = rawAddress.startsWith("/") ? rawAddress : `/${rawAddress}`;
    if (adresseOsc.length <= 1) {
      afficherStatutOsc(hote, raspberry, status, false, "Erreur: adresse OSC vide.");
      return;
    }

    const portNumerique = Number.parseInt(port, 10);
    let valeurOsc = valeur;
    if (estCommandePlay(rawAddress)) {
      champsPlay.synchroniserArguments(argsInput);
      valeurOsc = argsInput.value;
      const etatPlay = champsPlay.lireEtat();
      if (etatPlay.playFichier && etatPlay.playSonNumber === undefined) {
        afficherStatutOsc(
          hote,
          raspberry,
          status,
          false,
          "Ce fichier n'est pas jouable.\nSkini lit uniquement son500.wav, son501.wav, …\nRenvoyez-le via Send Audio, puis actualisez la liste."
        );
        return;
      }
    }

    const payload: Record<string, unknown> & { type: string } = {
      type: "sendOSCmessage",
      raspIP: raspberry.ip,
      OSCMessage: adresseOsc,
      OSCValue: valeurOsc,
    };
    if (Number.isFinite(portNumerique) && portNumerique > 0 && portNumerique <= 65535) {
      payload.OSCPort = portNumerique;
    }

    if (!hote.sendMessage(payload)) {
      afficherStatutOsc(
        hote,
        raspberry,
        status,
        false,
        "Erreur: WebSocket non connecte.\n" +
          "- Ouvrez la fenetre Search Raspberry\n" +
          "- Verifiez que le serveur Raspberry est lance (port 8383)"
      );
      return;
    }

    afficherStatutOsc(
      hote,
      raspberry,
      status,
      true,
      `Envoi en cours...\n` +
        `- ip: ${raspberry.ip}\n` +
        `- port: ${payload.OSCPort || 4000}\n` +
        `- address: ${adresseOsc}\n` +
        `- args: ${String(valeurOsc || "").trim()}`
    );
  };

  sendBtn.disabled = true;
  return executer().finally(() => {
    sendBtn.disabled = !raspberry.isOnline;
  });
}
