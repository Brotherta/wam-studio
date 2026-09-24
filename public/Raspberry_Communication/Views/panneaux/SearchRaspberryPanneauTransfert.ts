import Raspberry from "../../Models/Raspberry";
import {
  formatTexteProgression,
  formaterTexteErreurTransfert,
  type TransfertDraft,
} from "../../utils/agent-transfert/AgentTransfertHelpers";

export type TransfertLastStatus = {
  ok: boolean;
  text: string;
  atMs: number;
  state: string;
  uploadPercent: number;
  scpPercent: number;
  agentConnecte: boolean;
};

export type HotePanneauTransfert = {
  agentBaseUrl: string;
  agentTransfertActif: boolean;
  transfertDraftByIp: Map<string, TransfertDraft>;
  transfertLastStatusByIp: Map<string, TransfertLastStatus>;
  demarrerTransfert: (raspberry: Raspberry, fichier: File, draft: TransfertDraft) => void;
  annulerTransfert: () => void;
  lancerAgentTransfert: () => void;
};

function brouillonParDefaut(): TransfertDraft {
  return {};
}

function mettreAJourBoutonsTransfert(
  sendBtn: HTMLButtonElement | null,
  cancelBtn: HTMLButtonElement | null,
  statut: TransfertLastStatus,
  agentActif: boolean
): void {
  const enCours = ["RECEIVING", "VERIFYING", "SENDING"].includes(statut.state);
  const agentPret = agentActif || statut.agentConnecte;

  if (sendBtn) {
    sendBtn.disabled = enCours || !agentPret;
    if (!agentPret) {
      sendBtn.title = "Lancez d'abord l'agent de transfert (port 3100).";
    } else if (enCours) {
      sendBtn.title = "Transfert en cours...";
    } else {
      sendBtn.title = "";
    }
  }
  if (cancelBtn) {
    cancelBtn.disabled = !enCours;
  }
}

export function appliquerEtatAgentDansDom(
  conteneur: ParentNode,
  agentActif: boolean,
  statut?: TransfertLastStatus
): boolean {
  const dot = conteneur.querySelector<HTMLElement>("[data-agent-dot]");
  const label = conteneur.querySelector<HTMLElement>("[data-agent-label]");
  const sendBtn = conteneur.querySelector<HTMLButtonElement>("[data-transfert-envoyer]");
  const cancelBtn = conteneur.querySelector<HTMLButtonElement>("[data-transfert-annuler]");
  if (!dot || !label) return false;
  dot.style.backgroundColor = agentActif ? "#1f8b4c" : "#a53333";
  label.innerText = agentActif
    ? "Agent actif (port 3100)"
    : "Agent arrete — cliquez « Lancer l'agent » ou npm run dev dans agent-transfert/";
  if (statut) {
    mettreAJourBoutonsTransfert(sendBtn, cancelBtn, statut, agentActif);
  }
  return true;
}

export function appliquerStatutTransfertDansDom(
  conteneur: ParentNode,
  statut: TransfertLastStatus,
  agentActif: boolean
): boolean {
  const barreUpload = conteneur.querySelector<HTMLProgressElement>("[data-transfert-upload]");
  const barreScp = conteneur.querySelector<HTMLProgressElement>("[data-transfert-scp]");
  const detailUpload = conteneur.querySelector<HTMLElement>("[data-transfert-detail-upload]");
  const detailScp = conteneur.querySelector<HTMLElement>("[data-transfert-detail-scp]");
  const status = conteneur.querySelector<HTMLElement>("[data-transfert-status]");
  const sendBtn = conteneur.querySelector<HTMLButtonElement>("[data-transfert-envoyer]");
  const cancelBtn = conteneur.querySelector<HTMLButtonElement>("[data-transfert-annuler]");
  if (!barreUpload || !barreScp || !status) return false;

  barreUpload.value = statut.uploadPercent;
  barreScp.value = statut.scpPercent;
  if (detailUpload) detailUpload.textContent = statut.uploadPercent > 0 ? `Upload : ${statut.uploadPercent}%` : "Upload : en attente.";
  if (detailScp) detailScp.textContent = statut.scpPercent > 0 ? `SCP : ${statut.scpPercent}%` : "SCP : en attente.";
  status.style.borderColor =
    statut.ok && statut.state !== "FAILED"
      ? statut.state === "COMPLETED"
        ? "#1f8b4c"
        : "#3b4046"
      : "#a53333";
  status.innerText = statut.text;

  mettreAJourBoutonsTransfert(sendBtn, cancelBtn, statut, agentActif);
  return true;
}

/** Panneau d'envoi de fichier audio vers le Raspberry via l'agent local (port 3100). */
export function construirePanneauTransfert(hote: HotePanneauTransfert, raspberry: Raspberry): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-transfert-panel", raspberry.ip);
  wrapper.style.marginTop = "4px";
  wrapper.style.paddingTop = "4px";

  const title = document.createElement("div");
  title.innerHTML = "<strong>Transfert audio (agent local)</strong>";
  wrapper.appendChild(title);

  const hint = document.createElement("div");
  hint.style.fontSize = "11px";
  hint.style.opacity = "0.75";
  hint.style.marginTop = "4px";
  hint.innerText = `Agent: ${hote.agentBaseUrl}`;
  wrapper.appendChild(hint);

  const agentRow = document.createElement("div");
  agentRow.style.display = "flex";
  agentRow.style.alignItems = "center";
  agentRow.style.gap = "8px";
  agentRow.style.marginTop = "6px";
  agentRow.style.flexWrap = "wrap";

  const agentDot = document.createElement("span");
  agentDot.setAttribute("data-agent-dot", "1");
  agentDot.style.display = "inline-block";
  agentDot.style.width = "10px";
  agentDot.style.height = "10px";
  agentDot.style.borderRadius = "50%";

  const agentLabel = document.createElement("span");
  agentLabel.setAttribute("data-agent-label", "1");
  agentLabel.style.fontSize = "12px";

  const launchAgentBtn = document.createElement("button");
  launchAgentBtn.type = "button";
  launchAgentBtn.innerText = "Lancer l'agent";
  launchAgentBtn.className = "btn btn-sm btn-secondary";
  launchAgentBtn.title = "Demarre npm run dev dans agent-transfert/ via le serveur Raspberry";
  launchAgentBtn.addEventListener("click", () => hote.lancerAgentTransfert());

  agentRow.appendChild(agentDot);
  agentRow.appendChild(agentLabel);
  agentRow.appendChild(launchAgentBtn);
  wrapper.appendChild(agentRow);

  const form = document.createElement("div");
  form.style.display = "grid";
  form.style.gridTemplateColumns = "120px 1fr";
  form.style.gap = "6px 10px";
  form.style.marginTop = "8px";

  const draft = hote.transfertDraftByIp.get(raspberry.ip) || brouillonParDefaut();

  const fichierLabel = document.createElement("div");
  fichierLabel.innerText = "Fichier";
  fichierLabel.style.opacity = "0.9";
  const fichierInput = document.createElement("input");
  fichierInput.type = "file";
  fichierInput.accept = ".wav,.mp3,audio/wav,audio/mpeg";

  form.appendChild(fichierLabel);
  form.appendChild(fichierInput);
  wrapper.appendChild(form);

  const barres = document.createElement("div");
  barres.style.marginTop = "10px";
  barres.style.display = "grid";
  barres.style.gap = "6px";

  const barreUpload = document.createElement("progress");
  barreUpload.setAttribute("data-transfert-upload", "1");
  barreUpload.max = 100;
  barreUpload.value = 0;
  barreUpload.style.width = "100%";
  const detailUpload = document.createElement("div");
  detailUpload.setAttribute("data-transfert-detail-upload", "1");
  detailUpload.style.fontSize = "11px";
  detailUpload.style.opacity = "0.85";
  detailUpload.textContent = "Upload : en attente.";

  const barreScp = document.createElement("progress");
  barreScp.setAttribute("data-transfert-scp", "1");
  barreScp.max = 100;
  barreScp.value = 0;
  barreScp.style.width = "100%";
  const detailScp = document.createElement("div");
  detailScp.setAttribute("data-transfert-detail-scp", "1");
  detailScp.style.fontSize = "11px";
  detailScp.style.opacity = "0.85";
  detailScp.textContent = "SCP : en attente.";

  barres.appendChild(barreUpload);
  barres.appendChild(detailUpload);
  barres.appendChild(barreScp);
  barres.appendChild(detailScp);
  wrapper.appendChild(barres);

  const buttonsRow = document.createElement("div");
  buttonsRow.style.display = "flex";
  buttonsRow.style.gap = "8px";
  buttonsRow.style.marginTop = "10px";
  buttonsRow.style.flexWrap = "wrap";

  const sendBtn = document.createElement("button");
  sendBtn.setAttribute("data-transfert-envoyer", "1");
  sendBtn.innerText = "Envoyer vers Pi";
  sendBtn.className = "btn btn-sm btn-primary";

  const cancelBtn = document.createElement("button");
  cancelBtn.setAttribute("data-transfert-annuler", "1");
  cancelBtn.innerText = "Annuler";
  cancelBtn.className = "btn btn-sm btn-secondary";
  cancelBtn.disabled = true;

  buttonsRow.appendChild(sendBtn);
  buttonsRow.appendChild(cancelBtn);
  wrapper.appendChild(buttonsRow);

  const status = document.createElement("div");
  status.setAttribute("data-transfert-status", "1");
  status.style.marginTop = "10px";
  status.style.padding = "8px";
  status.style.borderRadius = "8px";
  status.style.border = "1px solid #2f363d";
  status.style.backgroundColor = "#12181d";
  status.style.fontFamily = "monospace";
  status.style.fontSize = "12px";
  status.style.whiteSpace = "pre-wrap";
  status.style.wordBreak = "break-word";
  wrapper.appendChild(status);

  const last = hote.transfertLastStatusByIp.get(raspberry.ip);

  const enregistrerBrouillon = () => {
    const next: TransfertDraft = {};
    hote.transfertDraftByIp.set(raspberry.ip, next);
  };

  sendBtn.addEventListener("click", () => {
    enregistrerBrouillon();
    const fichier = fichierInput.files?.[0];
    if (!fichier) {
      const err: TransfertLastStatus = {
        ok: false,
        text: "Erreur: choisissez un fichier audio.",
        atMs: Date.now(),
        state: "FAILED",
        uploadPercent: 0,
        scpPercent: 0,
        agentConnecte: hote.agentTransfertActif,
      };
      hote.transfertLastStatusByIp.set(raspberry.ip, err);
      appliquerStatutTransfertDansDom(wrapper, err, hote.agentTransfertActif);
      return;
    }
    const draftCourant = hote.transfertDraftByIp.get(raspberry.ip) || brouillonParDefaut();
    hote.demarrerTransfert(raspberry, fichier, draftCourant);
  });

  cancelBtn.addEventListener("click", () => hote.annulerTransfert());

  [fichierInput].forEach((el) => {
    el.addEventListener("input", enregistrerBrouillon);
    el.addEventListener("change", enregistrerBrouillon);
  });

  enregistrerBrouillon();

  const statutInitial: TransfertLastStatus = last || {
    ok: true,
    text: "Pret. Choisissez un fichier .wav ou .mp3. Le nom sur le Pi est choisi automatiquement (rasp{id}-son1, son2, ...).",
    atMs: Date.now(),
    state: "IDLE",
    uploadPercent: 0,
    scpPercent: 0,
    agentConnecte: hote.agentTransfertActif,
  };
  if (last?.text.includes("Upload :") || last?.text.includes("SCP :")) {
    statutInitial.text = last.text;
  }
  if (last?.state === "FAILED" || last?.state === "CANCELLED") {
    statutInitial.text = last.text.includes("Vous pouvez reessayer")
      ? last.text
      : formaterTexteErreurTransfert(last.text);
  }
  appliquerEtatAgentDansDom(wrapper, hote.agentTransfertActif, statutInitial);
  appliquerStatutTransfertDansDom(wrapper, statutInitial, hote.agentTransfertActif);

  return wrapper;
}

export function mettreAJourStatutTransfertPanneau(
  hote: Pick<HotePanneauTransfert, "transfertLastStatusByIp">,
  ip: string,
  patch: Partial<TransfertLastStatus> & { text?: string }
): TransfertLastStatus {
  const precedent = hote.transfertLastStatusByIp.get(ip);
  const next: TransfertLastStatus = {
    ok: patch.ok ?? precedent?.ok ?? true,
    text: patch.text ?? precedent?.text ?? "",
    atMs: Date.now(),
    state: patch.state ?? precedent?.state ?? "IDLE",
    uploadPercent: patch.uploadPercent ?? precedent?.uploadPercent ?? 0,
    scpPercent: patch.scpPercent ?? precedent?.scpPercent ?? 0,
    agentConnecte: patch.agentConnecte ?? precedent?.agentConnecte ?? false,
  };
  hote.transfertLastStatusByIp.set(ip, next);
  return next;
}

export function texteProgressionTransfert(
  phase: "upload" | "scp",
  event: { current?: number; total?: number; percent?: number; speed?: number; remainingSeconds?: number }
): string {
  const prefixe = phase === "upload" ? "Upload" : "SCP";
  return `${prefixe} : ${formatTexteProgression(event)}`;
}
