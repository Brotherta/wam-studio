/**
 * Fonctions partagees par le client Web de test (Phase 6).
 * Export ESM pour tests Vitest et app.js.
 */

export function formatOctets(octets) {
  const valeur = Number(octets) || 0;
  if (valeur < 1024) return `${valeur} o`;
  if (valeur < 1024 * 1024) return `${(valeur / 1024).toFixed(1)} Ko`;
  if (valeur < 1024 * 1024 * 1024) return `${(valeur / (1024 * 1024)).toFixed(2)} Mo`;
  return `${(valeur / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

export function formatTempsRestant(secondes) {
  const s = Math.max(0, Math.round(Number(secondes) || 0));
  if (s < 60) return `~${s}s`;
  const minutes = Math.floor(s / 60);
  const reste = s % 60;
  return `~${minutes}m ${reste}s`;
}

export function formatTexteProgression(event) {
  if (!event || event.total <= 0) {
    return `${formatOctets(event?.current || 0)} recus`;
  }
  const debit = typeof event.speed === "number" ? `${event.speed.toFixed(2)} Mo/s` : "—";
  const temps = formatTempsRestant(event.remainingSeconds);
  return `${formatOctets(event.current)} / ${formatOctets(event.total)} — ${event.percent}% — ${debit} — ${temps}`;
}

export function extraireExtensionDepuisNomFichier(filename) {
  const point = filename.lastIndexOf(".");
  if (point <= 0 || point === filename.length - 1) return ".wav";
  return filename.slice(point).toLowerCase();
}

export const CHEMIN_SONS_SKINI_PI = "/home/pi/modulePre/PureData/compositions/skini/sons";

export function apercuCheminConvention(formulaire, nomFichierLocal) {
  const ext = extraireExtensionDepuisNomFichier(nomFichierLocal || "son.wav");
  const variante =
    formulaire.varianteIndex && formulaire.varianteIndex >= 1 ? `-${formulaire.varianteIndex}` : "";
  const nom = `son${formulaire.sonNumber}${variante}${ext}`;
  return `${CHEMIN_SONS_SKINI_PI}/${nom}`;
}

export function lireFormulaire(dom) {
  return {
    authMode: dom.authMode.value,
    sshHost: dom.sshHost.value.trim(),
    sshPort: Number(dom.sshPort.value) || 22,
    sshUsername: dom.sshUsername.value.trim() || "pi",
    privateKeyPath: dom.privateKeyPath.value.trim(),
    passphrase: dom.passphrase.value,
    sshPassword: dom.sshPassword.value,
    raspberryId: Number(dom.raspberryId.value),
    sonNumber: Number(dom.sonNumber.value),
    varianteIndex: dom.varianteIndex.value ? Number(dom.varianteIndex.value) : undefined,
  };
}

export function validerFormulaire(formulaire, fichier) {
  if (!fichier) {
    return { ok: false, error: "Choisissez un fichier audio (.wav ou .mp3)." };
  }
  if (!formulaire.sshHost) {
    return { ok: false, error: "Adresse IP SSH requise." };
  }
  if (!Number.isFinite(formulaire.raspberryId) || formulaire.raspberryId < 1) {
    return { ok: false, error: "ID Raspberry invalide." };
  }
  if (!Number.isFinite(formulaire.sonNumber) || formulaire.sonNumber < 1) {
    return { ok: false, error: "Numero de son invalide." };
  }
  if (formulaire.authMode === "key" && !formulaire.privateKeyPath) {
    return { ok: false, error: "Chemin de cle privee requis." };
  }
  if (formulaire.authMode === "password" && !formulaire.sshPassword) {
    return { ok: false, error: "Mot de passe SSH requis." };
  }
  return { ok: true };
}

export function construireEntetesUploadNommage(formulaire, transferId) {
  const entetes = {
    "X-Transfer-Id": transferId,
    "X-Raspberry-Id": String(formulaire.raspberryId),
    "X-Son-Number": String(formulaire.sonNumber),
  };
  if (formulaire.varianteIndex && formulaire.varianteIndex >= 1) {
    entetes["X-Variante-Index"] = String(formulaire.varianteIndex);
  }
  return entetes;
}

export function construireCommandeStartTransfer(formulaire, transferId) {
  const commande = {
    type: "startTransfer",
    transferId,
    authMode: formulaire.authMode,
    sshHost: formulaire.sshHost,
    sshPort: formulaire.sshPort,
    sshUsername: formulaire.sshUsername,
    raspberryId: formulaire.raspberryId,
    sonNumber: formulaire.sonNumber,
  };
  if (formulaire.varianteIndex && formulaire.varianteIndex >= 1) {
    commande.varianteIndex = formulaire.varianteIndex;
  }
  if (formulaire.authMode === "key") {
    commande.privateKeyPath = formulaire.privateKeyPath;
    if (formulaire.passphrase) commande.passphrase = formulaire.passphrase;
  } else {
    commande.sshPassword = formulaire.sshPassword;
  }
  return commande;
}

export function classeEtat(state) {
  const map = {
    IDLE: "etat-neutre",
    RECEIVING: "etat-actif",
    VERIFYING: "etat-actif",
    READY: "etat-pret",
    SENDING: "etat-actif",
    COMPLETED: "etat-succes",
    FAILED: "etat-erreur",
    CANCELLED: "etat-erreur",
  };
  return map[state] || "etat-neutre";
}
