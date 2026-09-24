/** Dossier Skini sur le Raspberry (lecture OSC /play). */
export const CHEMIN_SONS_SKINI_PI =
  "/home/pi/modulePre/PureData/compositions/skini/sons";

/** Mot de passe SSH par defaut du compte pi sur le parc. */
export const MOT_DE_PASSE_SSH_PI = "raspberry";

/** Numero Skini reserve aux sons envoyes depuis WAM Studio (/play 500). */
export const SON_NUMERO_DEFAUT = 500;

/** Longueur max du suffixe libre (son500-intro.wav). */
export const NOM_SON_MAX_CARACTERES = 40;

export type TransfertDraft = {
  /** Nom exact sur le Pi. Doit rester son{N}.wav pour que Skini joue /play N. */
  nomFichierDistant?: string;
  /** Libelle d'affichage (daylight). N'est pas le nom du fichier sur le Pi. */
  nomSon?: string;
};

export type TransfertFormulaire = TransfertDraft & {
  sshHost: string;
  sshPort: number;
  sshUsername: string;
  raspberryId: number;
  sonNumber?: number;
};

function lireSonNumber(formulaire: Pick<TransfertFormulaire, "sonNumber">): number {
  const valeur = formulaire.sonNumber ?? SON_NUMERO_DEFAUT;
  if (!Number.isFinite(valeur) || valeur < SON_NUMERO_DEFAUT) {
    return SON_NUMERO_DEFAUT;
  }
  return valeur;
}

export function formatOctets(octets: number): string {
  const valeur = Number(octets) || 0;
  if (valeur < 1024) return `${valeur} o`;
  if (valeur < 1024 * 1024) return `${(valeur / 1024).toFixed(1)} Ko`;
  if (valeur < 1024 * 1024 * 1024) return `${(valeur / (1024 * 1024)).toFixed(2)} Mo`;
  return `${(valeur / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

export function formatTempsRestant(secondes: number): string {
  const s = Math.max(0, Math.round(Number(secondes) || 0));
  if (s < 60) return `~${s}s`;
  const minutes = Math.floor(s / 60);
  const reste = s % 60;
  return `~${minutes}m ${reste}s`;
}

/** Message d'erreur affiche une seule fois dans le panneau transfert. */
export function formaterTexteErreurTransfert(message: string): string {
  const sansPrefixe = message.replace(/^(Erreur:\s*)+/i, "").trim();
  const sansSuffixe = sansPrefixe
    .replace(/\n*Vous pouvez reessayer avec un autre fichier\.?\s*$/i, "")
    .trim();
  return `Erreur: ${sansSuffixe}\n\nVous pouvez reessayer avec un autre fichier.`;
}

export function formatTexteProgression(event: {
  current?: number;
  total?: number;
  percent?: number;
  speed?: number;
  remainingSeconds?: number;
}): string {
  if (!event || (event.total ?? 0) <= 0) {
    return `${formatOctets(event?.current || 0)} recus`;
  }
  const debit = typeof event.speed === "number" ? `${event.speed.toFixed(2)} Mo/s` : "—";
  const temps = formatTempsRestant(event.remainingSeconds ?? 0);
  return `${formatOctets(event.current ?? 0)} / ${formatOctets(event.total ?? 0)} — ${event.percent ?? 0}% — ${debit} — ${temps}`;
}

export function extraireExtensionDepuisNomFichier(filename: string): string {
  const point = filename.lastIndexOf(".");
  if (point <= 0 || point === filename.length - 1) return ".wav";
  return filename.slice(point).toLowerCase();
}

export function extraireNumeroRaspberryDepuisIp(ip: string): number | undefined {
  const match = ip.match(/\.(\d+)$/);
  if (!match) return undefined;
  const numero = Number.parseInt(match[1], 10);
  return Number.isFinite(numero) && numero >= 1 ? numero : undefined;
}

/** Nom affiche dans Search Raspberry : « Raspberry 75 » (derive de l'IP si besoin). */
export function formaterNomAffichageRaspberry(ip: string, info?: string): string {
  if (info && info.startsWith("Raspberry ")) {
    return info.trim();
  }
  const numero = extraireNumeroRaspberryDepuisIp(ip);
  if (numero !== undefined) {
    return `Raspberry ${numero}`;
  }
  return ip;
}

/** Conserve le libelle quand le heartbeat Pi envoie cpu:/freeMem: a la place. */
export function fusionnerInfoRaspberry(ip: string, infoEntrant: string, infoExistant?: string): string {
  if (infoEntrant.startsWith("Raspberry ")) {
    return infoEntrant;
  }
  if (infoExistant && infoExistant.startsWith("Raspberry ")) {
    return infoExistant;
  }
  return formaterNomAffichageRaspberry(ip);
}

/** Nom affiche dans l'editeur WAM : « rasp 75 ». */
export function formaterNomPisteRaspberry(raspberryId: number): string {
  return `rasp ${raspberryId}`;
}

/** Prefixe des fichiers sur le Pi : « rasp75 ». */
export function formaterPrefixeFichierRaspberry(raspberryId: number): string {
  return `rasp${raspberryId}`;
}

/** Lit le numero Raspberry depuis un nom de piste (« rasp 75 », « rasp75 », etc.). */
export function lireNumeroRaspberryDepuisNomPiste(nom: string): number | undefined {
  if (typeof nom !== "string") {
    return undefined;
  }
  const match = nom.trim().match(/^rasp\s*(\d+)$/i);
  if (!match) {
    return undefined;
  }
  const numero = Number.parseInt(match[1], 10);
  return Number.isFinite(numero) && numero >= 1 ? numero : undefined;
}

export function lireNumeroRaspberryDepuisElementPiste(element: {
  name?: string;
  trackNameInput?: { value?: string };
  getAttribute?: (nom: string) => string | null;
}): number | undefined {
  const candidats = [element.name, element.trackNameInput?.value];
  for (const candidat of candidats) {
    const numero = lireNumeroRaspberryDepuisNomPiste(candidat ?? "");
    if (numero !== undefined) {
      return numero;
    }
  }
  const attribut = element.getAttribute?.("data-raspberry-lie");
  if (!attribut) {
    return undefined;
  }
  const numero = Number.parseInt(attribut, 10);
  return Number.isFinite(numero) && numero >= 1 ? numero : undefined;
}

export function nomsPisteCorrespondentAuRaspberry(
  nomPiste: string,
  raspberryId: number
): boolean {
  return lireNumeroRaspberryDepuisNomPiste(nomPiste) === raspberryId;
}

/**
 * Transforme un libelle libre en suffixe de fichier : lettres, chiffres, tirets.
 * "Mon intro !" -> "mon-intro"
 */
export function sanitiserNomSon(brut: string): string {
  return brut
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, NOM_SON_MAX_CARACTERES)
    .replace(/-+$/g, "");
}

export function validerNomSonObligatoire(
  brut: string
): { ok: true; slug: string } | { ok: false; error: string } {
  const slug = sanitiserNomSon(brut);
  if (!slug) {
    return { ok: false, error: "Indiquez un nom pour le son (lettres ou chiffres)." };
  }
  return { ok: true, slug };
}

type ChampsNomFichierDistant = Pick<
  TransfertFormulaire,
  "raspberryId" | "sonNumber" | "nomSon" | "nomFichierDistant"
>;

function estNomFichierSkiniJouable(nomFichier: string): boolean {
  return /^son\d+/i.test(nomFichier.trim());
}

export function construireNomFichierDistant(
  formulaire: ChampsNomFichierDistant,
  nomFichierLocal: string
): string {
  const ext = extraireExtensionDepuisNomFichier(nomFichierLocal || "son.wav");
  const propose = formulaire.nomFichierDistant?.trim() ?? "";
  if (propose && estNomFichierSkiniJouable(propose)) {
    return propose;
  }
  return `son${lireSonNumber(formulaire)}${ext}`;
}

export function apercuCheminComplet(
  formulaire: ChampsNomFichierDistant,
  nomFichierLocal: string
): string {
  const nom = construireNomFichierDistant(formulaire, nomFichierLocal);
  return `${CHEMIN_SONS_SKINI_PI}/${nom}`;
}

export function validerFormulaireTransfert(
  formulaire: TransfertFormulaire,
  fichier: File | null
): { ok: true } | { ok: false; error: string } {
  if (!fichier) {
    return { ok: false, error: "Choisissez un fichier audio (.wav ou .mp3)." };
  }
  if (!formulaire.sshHost) {
    return { ok: false, error: "Adresse IP SSH requise." };
  }
  if (!Number.isFinite(formulaire.raspberryId) || formulaire.raspberryId < 1) {
    return { ok: false, error: "ID Raspberry invalide (dernier octet de l'IP)." };
  }
  return { ok: true };
}

export function construireEntetesUploadNommage(
  formulaire: Pick<TransfertFormulaire, "raspberryId" | "sonNumber">,
  transferId: string
): Record<string, string> {
  const entetes: Record<string, string> = {
    "X-Transfer-Id": transferId,
    "X-Raspberry-Id": String(formulaire.raspberryId),
    "X-Son-Number": String(lireSonNumber(formulaire)),
  };
  return entetes;
}

export function construireCommandeStartTransfer(
  formulaire: TransfertFormulaire,
  transferId: string
): Record<string, unknown> {
  const commande: Record<string, unknown> = {
    type: "startTransfer",
    transferId,
    authMode: "password",
    sshHost: formulaire.sshHost,
    sshPort: formulaire.sshPort,
    sshUsername: formulaire.sshUsername,
    sshPassword: MOT_DE_PASSE_SSH_PI,
    raspberryId: formulaire.raspberryId,
    sonNumber: lireSonNumber(formulaire),
  };
  commande.remotePath = apercuCheminComplet(formulaire, "export.wav");
  return commande;
}
