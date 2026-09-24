import type { CibleSshTransfert } from "./Transfer";
import { estNumeroSonWamAutorise } from "../config/RemotePathConvention";

export type CommandeSocket =
  | CommandeStartTransfer
  | CommandeCancelTransfer
  | CommandeDeleteTransfer
  | CommandeSubscribe
  | CommandeUnsubscribe;

export type CommandeStartTransfer = {
  type: "startTransfer";
  transferId: string;
  raspberryId?: number;
  sonNumber?: number;
  varianteIndex?: number;
  sshHost?: string;
  sshPort?: number;
  sshUsername?: string;
  authMode?: "key" | "password";
  sshPassword?: string;
  privateKeyPath?: string;
  passphrase?: string;
  /** Chemin absolu sur le Pi (API avancee / tests). Prioritaire sur la convention skini. */
  remotePath?: string;
};

export type CommandeCancelTransfer = {
  type: "cancelTransfer";
  transferId: string;
};

export type CommandeDeleteTransfer = {
  type: "deleteTransfer";
  transferId: string;
};

export type CommandeSubscribe = {
  type: "subscribe";
  transferId: string;
};

export type CommandeUnsubscribe = {
  type: "unsubscribe";
  transferId: string;
};

export type ResultatAnalyseCommande =
  | { ok: true; commande: CommandeSocket }
  | { ok: false; error: string };

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === "object" && valeur !== null;
}

function lireChaine(objet: Record<string, unknown>, cle: string): string | undefined {
  const valeur = objet[cle];
  return typeof valeur === "string" && valeur.length > 0 ? valeur : undefined;
}

function lireNombre(objet: Record<string, unknown>, cle: string): number | undefined {
  const valeur = objet[cle];
  if (typeof valeur === "number" && Number.isFinite(valeur)) {
    return valeur;
  }
  if (typeof valeur === "string" && valeur.trim() !== "") {
    const parse = Number.parseInt(valeur, 10);
    return Number.isFinite(parse) ? parse : undefined;
  }
  return undefined;
}

export function analyserCommandeSocket(payload: unknown): ResultatAnalyseCommande {
  if (!estObjet(payload)) {
    return { ok: false, error: "Commande invalide (objet JSON attendu)." };
  }

  const type = payload.type;
  if (type === "subscribe" || type === "unsubscribe") {
    const transferId = lireChaine(payload, "transferId");
    if (!transferId) {
      return { ok: false, error: `Champ transferId requis pour ${type}.` };
    }
    return { ok: true, commande: { type, transferId } };
  }

  if (type === "cancelTransfer" || type === "deleteTransfer") {
    const transferId = lireChaine(payload, "transferId");
    if (!transferId) {
      return { ok: false, error: `Champ transferId requis pour ${type}.` };
    }
    return { ok: true, commande: { type, transferId } };
  }

  if (type === "startTransfer") {
    const transferId = lireChaine(payload, "transferId");
    const remotePath = lireChaine(payload, "remotePath");
    const raspberryId = lireNombre(payload, "raspberryId");
    const sonNumber = lireNombre(payload, "sonNumber");
    if (!transferId) {
      return { ok: false, error: "Champ transferId requis pour startTransfer." };
    }
    if (!remotePath) {
      if (raspberryId === undefined || raspberryId < 1) {
        return { ok: false, error: "Champ raspberryId invalide pour startTransfer." };
      }
      if (sonNumber === undefined || !estNumeroSonWamAutorise(sonNumber)) {
        return {
          ok: false,
          error: "Champ sonNumber invalide pour startTransfer (minimum 500 pour WAM).",
        };
      }
    }
    const varianteIndex = lireNombre(payload, "varianteIndex");
    const commande: CommandeStartTransfer = {
      type: "startTransfer",
      transferId,
    };
    if (raspberryId !== undefined && raspberryId >= 1) {
      commande.raspberryId = raspberryId;
    }
    if (sonNumber !== undefined && estNumeroSonWamAutorise(sonNumber)) {
      commande.sonNumber = sonNumber;
    }
    if (remotePath) {
      commande.remotePath = remotePath;
    }
    if (varianteIndex !== undefined && varianteIndex >= 1 && !remotePath) {
      commande.varianteIndex = varianteIndex;
    }
    const sshHost = lireChaine(payload, "sshHost");
    const sshUsername = lireChaine(payload, "sshUsername");
    const sshPort = lireNombre(payload, "sshPort");
    if (sshHost) commande.sshHost = sshHost;
    if (sshUsername) commande.sshUsername = sshUsername;
    if (sshPort !== undefined) commande.sshPort = sshPort;
    const authMode = payload.authMode;
    if (authMode === "key" || authMode === "password") {
      commande.authMode = authMode;
    }
    const sshPassword = lireChaine(payload, "sshPassword");
    const privateKeyPath = lireChaine(payload, "privateKeyPath");
    const passphrase = lireChaine(payload, "passphrase");
    if (sshPassword) commande.sshPassword = sshPassword;
    if (privateKeyPath) commande.privateKeyPath = privateKeyPath;
    if (passphrase) commande.passphrase = passphrase;
    return { ok: true, commande };
  }

  return { ok: false, error: `Type de commande inconnu: ${String(type)}` };
}

export function fusionnerCibleSsh(
  commande: CommandeStartTransfer,
  configPersistee: { sshHost?: string; sshPort?: number; sshLogin?: string }
): CibleSshTransfert {
  const host = commande.sshHost || configPersistee.sshHost;
  const username = commande.sshUsername || configPersistee.sshLogin || "pi";
  const port = commande.sshPort ?? configPersistee.sshPort ?? 22;
  if (!host) {
    throw new Error("Adresse SSH manquante (sshHost dans la commande ou config locale).");
  }
  return { host, port, username };
}
