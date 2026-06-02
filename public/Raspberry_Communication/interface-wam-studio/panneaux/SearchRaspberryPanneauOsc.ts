import Raspberry from "../../Raspberry";

export type HotePanneauOsc = {
  oscDraftByIp: Map<string, { address: string; args: string; port: string }>;
  oscLastStatusByIp: Map<string, { ok: boolean; text: string; atMs: number }>;
  sendMessage: (message: Record<string, unknown> & { type: string }) => boolean;
};

/** Formulaire OSC affiché dans le panneau détails d’un Raspberry. */
export function construirePanneauOsc(hote: HotePanneauOsc, raspberry: Raspberry): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.style.marginTop = "12px";
  wrapper.style.paddingTop = "10px";
  wrapper.style.borderTop = "1px solid #2f363d";

  const title = document.createElement("div");
  title.innerHTML = "<strong>Commande OSC</strong>";
  wrapper.appendChild(title);

  const form = document.createElement("div");
  form.style.display = "grid";
  form.style.gridTemplateColumns = "110px 1fr";
  form.style.gap = "6px 10px";
  form.style.marginTop = "8px";

  const addrLabel = document.createElement("div");
  addrLabel.innerText = "Adresse";
  addrLabel.style.opacity = "0.9";
  const addrInput = document.createElement("input");
  addrInput.type = "text";
  addrInput.placeholder = "/play";
  const draft = hote.oscDraftByIp.get(raspberry.ip);
  addrInput.value = draft ? draft.address : "/play";
  addrInput.style.width = "100%";

  const argsLabel = document.createElement("div");
  argsLabel.innerText = "Arguments";
  argsLabel.style.opacity = "0.9";
  const argsInput = document.createElement("input");
  argsInput.type = "text";
  argsInput.placeholder = "ex: 1 90";
  argsInput.value = draft ? draft.args : "1 90";
  argsInput.style.width = "100%";

  const portLabel = document.createElement("div");
  portLabel.innerText = "Port UDP";
  portLabel.style.opacity = "0.9";
  const portInput = document.createElement("input");
  portInput.type = "number";
  portInput.placeholder = "4000";
  portInput.value = draft ? draft.port : "4000";
  portInput.min = "1";
  portInput.max = "65535";
  portInput.style.width = "140px";

  form.appendChild(addrLabel);
  form.appendChild(addrInput);
  form.appendChild(argsLabel);
  form.appendChild(argsInput);
  form.appendChild(portLabel);
  form.appendChild(portInput);
  wrapper.appendChild(form);

  const buttonsRow = document.createElement("div");
  buttonsRow.style.display = "flex";
  buttonsRow.style.gap = "8px";
  buttonsRow.style.marginTop = "10px";
  buttonsRow.style.flexWrap = "wrap";

  const sendBtn = document.createElement("button");
  sendBtn.innerText = "Envoyer";
  sendBtn.className = "btn btn-sm btn-primary";
  sendBtn.disabled = !raspberry.isOnline;

  const quickPlay = document.createElement("button");
  quickPlay.innerText = "/play 1 90";
  quickPlay.className = "btn btn-sm btn-secondary";
  quickPlay.disabled = !raspberry.isOnline;
  quickPlay.addEventListener("click", () => {
    addrInput.value = "/play";
    argsInput.value = "1 90";
    hote.oscDraftByIp.set(raspberry.ip, { address: addrInput.value, args: argsInput.value, port: portInput.value });
  });

  const quickStopAll = document.createElement("button");
  quickStopAll.innerText = "/stop -1";
  quickStopAll.className = "btn btn-sm btn-secondary";
  quickStopAll.disabled = !raspberry.isOnline;
  quickStopAll.addEventListener("click", () => {
    addrInput.value = "/stop";
    argsInput.value = "-1";
    hote.oscDraftByIp.set(raspberry.ip, { address: addrInput.value, args: argsInput.value, port: portInput.value });
  });

  const quickLevel = document.createElement("button");
  quickLevel.innerText = "/level 90";
  quickLevel.className = "btn btn-sm btn-secondary";
  quickLevel.disabled = !raspberry.isOnline;
  quickLevel.addEventListener("click", () => {
    addrInput.value = "/level";
    argsInput.value = "90";
    hote.oscDraftByIp.set(raspberry.ip, { address: addrInput.value, args: argsInput.value, port: portInput.value });
  });

  const quickComposition = document.createElement("button");
  quickComposition.innerText = "/composition 1";
  quickComposition.className = "btn btn-sm btn-secondary";
  quickComposition.disabled = !raspberry.isOnline;
  quickComposition.addEventListener("click", () => {
    addrInput.value = "/composition";
    argsInput.value = "1";
    hote.oscDraftByIp.set(raspberry.ip, { address: addrInput.value, args: argsInput.value, port: portInput.value });
  });

  buttonsRow.appendChild(sendBtn);
  buttonsRow.appendChild(quickPlay);
  buttonsRow.appendChild(quickComposition);
  buttonsRow.appendChild(quickLevel);
  buttonsRow.appendChild(quickStopAll);
  wrapper.appendChild(buttonsRow);

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

  const last = hote.oscLastStatusByIp.get(raspberry.ip);
  if (last) {
    status.style.borderColor = last.ok ? "#1f8b4c" : "#a53333";
    status.innerText = last.text;
  } else {
    status.style.opacity = "0.85";
    status.innerText = raspberry.isOnline
      ? "Aucun envoi OSC effectue pour ce Raspberry."
      : "Raspberry hors ligne: envoi OSC desactive.";
  }
  wrapper.appendChild(status);

  const enregistrerBrouillon = () => {
    hote.oscDraftByIp.set(raspberry.ip, { address: addrInput.value, args: argsInput.value, port: portInput.value });
  };

  const doSend = () => {
    if (!raspberry.isOnline) {
      return;
    }
    const rawAddress = addrInput.value.trim();
    const message = rawAddress.startsWith("/") ? rawAddress.slice(1) : rawAddress;
    const value = argsInput.value;
    const port = Number.parseInt(portInput.value, 10);
    enregistrerBrouillon();

    if (message.length === 0) {
      hote.oscLastStatusByIp.set(raspberry.ip, {
        ok: false,
        atMs: Date.now(),
        text: "Erreur: adresse OSC vide.",
      });
      status.style.borderColor = "#a53333";
      status.innerText = hote.oscLastStatusByIp.get(raspberry.ip)?.text || "";
      return;
    }

    const payload: Record<string, unknown> & { type: string } = {
      type: "sendOSCmessage",
      raspIP: raspberry.ip,
      OSCMessage: message,
      OSCValue: value,
    };
    if (Number.isFinite(port) && port > 0 && port <= 65535) {
      payload.OSCPort = port;
    }
    if (!hote.sendMessage(payload)) {
      hote.oscLastStatusByIp.set(raspberry.ip, {
        ok: false,
        atMs: Date.now(),
        text:
          "Erreur: WebSocket non connecte.\n" +
          "- Ouvrez la fenetre Search Raspberry\n" +
          "- Verifiez que le serveur Raspberry est lance (port 8383)",
      });
      status.style.borderColor = "#a53333";
      status.innerText = hote.oscLastStatusByIp.get(raspberry.ip)?.text || "";
      return;
    }
    hote.oscLastStatusByIp.set(raspberry.ip, {
      ok: true,
      atMs: Date.now(),
      text: `Envoi en cours...\n- ip: ${raspberry.ip}\n- port: ${payload.OSCPort || 4000}\n- address: /${message}\n- args: ${String(value || "").trim()}`,
    });
    status.style.borderColor = "#3b4046";
    status.innerText = hote.oscLastStatusByIp.get(raspberry.ip)?.text || "";
  };

  sendBtn.addEventListener("click", () => doSend());
  addrInput.addEventListener("input", enregistrerBrouillon);
  argsInput.addEventListener("input", enregistrerBrouillon);
  portInput.addEventListener("input", enregistrerBrouillon);
  addrInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSend();
    }
  });
  argsInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doSend();
    }
  });

  return wrapper;
}
