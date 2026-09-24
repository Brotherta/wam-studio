import {
  apercuCheminConvention,
  classeEtat,
  construireEntetesUploadNommage,
  construireCommandeStartTransfer,
  formatTexteProgression,
  lireFormulaire,
  validerFormulaire,
} from "./helpers.js";

const dom = {
  authMode: document.getElementById("authMode"),
  sshHost: document.getElementById("sshHost"),
  sshPort: document.getElementById("sshPort"),
  sshUsername: document.getElementById("sshUsername"),
  privateKeyPath: document.getElementById("privateKeyPath"),
  passphrase: document.getElementById("passphrase"),
  sshPassword: document.getElementById("sshPassword"),
  blocCle: document.getElementById("bloc-cle"),
  blocPassword: document.getElementById("bloc-password"),
  apercuChemin: document.getElementById("apercu-chemin"),
  fichier: document.getElementById("fichier"),
  metaNom: document.getElementById("meta-nom"),
  metaTaille: document.getElementById("meta-taille"),
  metaType: document.getElementById("meta-type"),
  raspberryId: document.getElementById("raspberryId"),
  sonNumber: document.getElementById("sonNumber"),
  varianteIndex: document.getElementById("varianteIndex"),
  btnEnvoyer: document.getElementById("btn-envoyer"),
  btnAnnuler: document.getElementById("btn-annuler"),
  btnSupprimer: document.getElementById("btn-supprimer"),
  etat: document.getElementById("etat"),
  barreUpload: document.getElementById("barre-upload"),
  barreScp: document.getElementById("barre-scp"),
  detailUpload: document.getElementById("detail-upload"),
  detailScp: document.getElementById("detail-scp"),
  bandeauSucces: document.getElementById("bandeau-succes"),
  bandeauErreur: document.getElementById("bandeau-erreur"),
  journal: document.getElementById("journal"),
  socketStatut: document.getElementById("socket-statut"),
  transferIdAffiche: document.getElementById("transfer-id"),
};

const socket = io({ reconnection: true });

let transferIdCourant = null;
let envoiEnCours = false;

function horodatage() {
  return new Date().toLocaleTimeString();
}

function ajouterJournal(message) {
  const ligne = document.createElement("div");
  ligne.className = "ligne-journal";
  ligne.innerHTML = `<span class="heure">${horodatage()}</span>${message}`;
  dom.journal.prepend(ligne);
}

function afficherBandeau(type, texte) {
  dom.bandeauSucces.classList.remove("visible");
  dom.bandeauErreur.classList.remove("visible");
  if (type === "succes") {
    dom.bandeauSucces.textContent = texte;
    dom.bandeauSucces.classList.add("visible");
  } else if (type === "erreur") {
    dom.bandeauErreur.textContent = texte;
    dom.bandeauErreur.classList.add("visible");
  }
}

function mettreAJourEtat(state) {
  dom.etat.textContent = state;
  dom.etat.className = `etat-badge ${classeEtat(state)}`;
}

function reinitialiserProgressions() {
  dom.barreUpload.value = 0;
  dom.barreScp.value = 0;
  dom.detailUpload.textContent = "En attente.";
  dom.detailScp.textContent = "En attente.";
}

function mettreAJourBoutons(state) {
  const enTransfert = ["RECEIVING", "VERIFYING", "SENDING"].includes(state);
  dom.btnEnvoyer.disabled = envoiEnCours || enTransfert;
  dom.btnAnnuler.disabled = !enTransfert || !transferIdCourant;
  dom.btnSupprimer.disabled = !transferIdCourant || enTransfert;
}

function mettreAJourApercuChemin() {
  const fichier = dom.fichier.files[0];
  if (!fichier) {
    dom.apercuChemin.textContent = "Chemin prevu : —";
    return;
  }
  const formulaire = lireFormulaire(dom);
  dom.apercuChemin.textContent =
    "Chemin prevu : " + apercuCheminConvention(formulaire, fichier.name);
}

function basculerModeAuth() {
  const modeCle = dom.authMode.value === "key";
  dom.blocCle.classList.toggle("cache", !modeCle);
  dom.blocPassword.classList.toggle("cache", modeCle);
}

function appliquerProgression(phase, event) {
  const barre = phase === "upload" ? dom.barreUpload : dom.barreScp;
  const detail = phase === "upload" ? dom.detailUpload : dom.detailScp;
  barre.value = event.percent || 0;
  detail.textContent = formatTexteProgression(event);
}

function appliquerSnapshot(snapshot) {
  if (!snapshot) return;
  mettreAJourEtat(snapshot.state);
  if (snapshot.derniereProgression) {
    appliquerProgression(snapshot.derniereProgression.phase, {
      current: snapshot.derniereProgression.current,
      total: snapshot.derniereProgression.total,
      percent: snapshot.derniereProgression.percent,
      speed: 0,
      remainingSeconds: 0,
    });
  }
  mettreAJourBoutons(snapshot.state);
}

function sAbonner() {
  if (!transferIdCourant) return;
  socket.emit("subscribe", { transferId: transferIdCourant });
}

function attendreEvenementTransfert(predicat, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off("transfer:event", ecouteur);
      reject(new Error("Delai depasse en attente du transfert."));
    }, timeoutMs);

    const ecouteur = (event) => {
      if (transferIdCourant && event.transferId !== transferIdCourant) return;
      if (!predicat(event)) return;
      clearTimeout(timer);
      socket.off("transfer:event", ecouteur);
      resolve(event);
    };
    socket.on("transfer:event", ecouteur);
  });
}

async function chargerConfigLocale() {
  try {
    const response = await fetch("/health");
    const payload = await response.json();
    const cfg = payload.configPersistee || {};
    if (cfg.sshHost) dom.sshHost.value = cfg.sshHost;
    if (cfg.sshPort) dom.sshPort.value = cfg.sshPort;
    if (cfg.sshLogin) dom.sshUsername.value = cfg.sshLogin;
    if (cfg.privateKeyPath) dom.privateKeyPath.value = cfg.privateKeyPath;
    ajouterJournal("Configuration locale chargee.");
  } catch {
    ajouterJournal("Configuration locale indisponible.");
  }
}

async function uploadFichier(fichier, transferId, formulaire) {
  const form = new FormData();
  form.append("file", fichier);
  const response = await fetch("/upload", {
    method: "POST",
    headers: construireEntetesUploadNommage(formulaire, transferId),
    body: form,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Upload HTTP echoue.");
  }
  return payload;
}

async function envoyerFichierComplet() {
  const fichier = dom.fichier.files[0];
  const formulaire = lireFormulaire(dom);
  const validation = validerFormulaire(formulaire, fichier);
  if (!validation.ok) {
    afficherBandeau("erreur", validation.error);
    return;
  }

  envoiEnCours = true;
  transferIdCourant = crypto.randomUUID();
  dom.transferIdAffiche.textContent = transferIdCourant;
  afficherBandeau(null);
  reinitialiserProgressions();
  mettreAJourEtat("RECEIVING");
  mettreAJourBoutons("RECEIVING");
  ajouterJournal("Demarrage du flux complet (upload + SCP).");

  sAbonner();

  try {
    const promesseReady = attendreEvenementTransfert(
      (event) => event.type === "state" && event.state === "READY"
    );

    ajouterJournal("Upload HTTP en cours...");
    const upload = await uploadFichier(fichier, transferIdCourant, formulaire);
    ajouterJournal(
      `Upload recu: ${upload.storedFilename || upload.filename} (${upload.size} octets).`
    );

    await promesseReady;

    const commande = construireCommandeStartTransfer(formulaire, transferIdCourant);
    socket.emit("command", commande);
    ajouterJournal("Commande startTransfer envoyee.");

    const fin = await attendreEvenementTransfert(
      (event) =>
        (event.type === "state" && (event.state === "COMPLETED" || event.state === "FAILED" || event.state === "CANCELLED")) ||
        event.type === "completed" ||
        event.type === "error"
    );

    if (fin.type === "completed" || fin.state === "COMPLETED") {
      afficherBandeau("succes", "Transfert termine avec succes sur le Raspberry.");
      ajouterJournal("SCP termine.");
    } else if (fin.type === "error") {
      throw new Error(fin.message);
    } else if (fin.state === "CANCELLED") {
      afficherBandeau("erreur", "Transfert annule.");
    } else {
      throw new Error("Transfert echoue.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    afficherBandeau("erreur", message);
    ajouterJournal(`Erreur: ${message}`);
  } finally {
    envoiEnCours = false;
    mettreAJourBoutons(dom.etat.textContent);
  }
}

socket.on("connect", () => {
  dom.socketStatut.textContent = "Socket connecte";
  dom.socketStatut.classList.add("connecte");
  dom.socketStatut.classList.remove("deconnecte");
  ajouterJournal(`Socket.IO connecte (${socket.id}).`);
  sAbonner();
});

socket.on("disconnect", () => {
  dom.socketStatut.textContent = "Socket deconnecte";
  dom.socketStatut.classList.remove("connecte");
  dom.socketStatut.classList.add("deconnecte");
  ajouterJournal("Socket.IO deconnecte — reconnexion automatique...");
});

socket.on("agent:event", (event) => {
  if (event.type === "log") ajouterJournal(event.message);
  if (event.type === "error") afficherBandeau("erreur", event.message);
});

socket.on("transfer:snapshot", (snapshot) => {
  if (transferIdCourant && snapshot.transferId !== transferIdCourant) return;
  appliquerSnapshot(snapshot);
  ajouterJournal(`Snapshot recu (${snapshot.state}).`);
});

socket.on("transfer:event", (event) => {
  if (transferIdCourant && event.transferId !== transferIdCourant) return;
  if (event.type === "progress" && event.phase === "upload") {
    appliquerProgression("upload", event);
  }
  if (event.type === "progress" && event.phase === "scp") {
    appliquerProgression("scp", event);
  }
  if (event.type === "state") {
    mettreAJourEtat(event.state);
    mettreAJourBoutons(event.state);
    ajouterJournal(`Etat: ${event.state}`);
    if (event.state === "SENDING") ajouterJournal("Debut SCP.");
  }
  if (event.type === "completed") {
    afficherBandeau("succes", "Transfert SCP termine.");
  }
  if (event.type === "error") {
    afficherBandeau("erreur", event.message);
    ajouterJournal(`Erreur: ${event.message}`);
  }
});

socket.on("command:ack", (ack) => {
  if (!ack.ok) {
    afficherBandeau("erreur", ack.error || "Commande refusee.");
    ajouterJournal(`Commande refusee: ${ack.error}`);
  }
});

dom.authMode.addEventListener("change", basculerModeAuth);
["raspberryId", "sonNumber", "varianteIndex"].forEach((id) => {
  document.getElementById(id).addEventListener("input", mettreAJourApercuChemin);
});
dom.fichier.addEventListener("change", () => {
  const file = dom.fichier.files[0];
  if (!file) return;
  dom.metaNom.textContent = file.name;
  dom.metaTaille.textContent = file.size;
  dom.metaType.textContent = file.type || "(inconnu)";
  mettreAJourApercuChemin();
});

dom.btnEnvoyer.addEventListener("click", () => {
  void envoyerFichierComplet();
});

dom.btnAnnuler.addEventListener("click", () => {
  if (!transferIdCourant) return;
  socket.emit("command", { type: "cancelTransfer", transferId: transferIdCourant });
  ajouterJournal("Annulation demandee.");
});

dom.btnSupprimer.addEventListener("click", () => {
  if (!transferIdCourant) return;
  socket.emit("command", { type: "deleteTransfer", transferId: transferIdCourant });
  transferIdCourant = null;
  dom.transferIdAffiche.textContent = "—";
  mettreAJourEtat("—");
  mettreAJourBoutons("IDLE");
  reinitialiserProgressions();
  afficherBandeau(null);
  ajouterJournal("Transfert supprime.");
});

basculerModeAuth();
void chargerConfigLocale();
ajouterJournal("Client de test Phase 6 pret.");
