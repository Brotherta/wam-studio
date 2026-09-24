export type ContexteErreurSsh = {
  operation: string;
  cheminDistant?: string;
  dossierDistant?: string;
  hote?: string;
};

const LIBELLES_CODE_SFTP: Record<number, string> = {
  2: "fichier ou dossier introuvable",
  3: "permission refusee sur le Raspberry",
  4: "echec SFTP (droits ou chemin invalide)",
  5: "message SFTP invalide",
  6: "pas de connexion SFTP",
  7: "connexion SFTP perdue",
  8: "operation SFTP non supportee",
};

function extraireMessageErreur(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }
  return String(error);
}

function extraireCodeErreur(error: unknown): string | number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  const candidat = error as { code?: string | number };
  return candidat.code;
}

function detailleMessageSsh(message: string, code: string | number | undefined): string {
  const messageNormalise = message.toLowerCase();
  if (messageNormalise.includes("authentication")) {
    return "authentification SSH refusee (mot de passe ou compte incorrect)";
  }
  if (messageNormalise.includes("timed out") || code === "ETIMEDOUT") {
    return "delai depasse : le Raspberry ne repond pas sur le port SSH";
  }
  if (code === "ECONNREFUSED") {
    return "connexion refusee : SSH inactif ou port 22 ferme sur le Raspberry";
  }
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
    return "hote SSH introuvable sur le reseau";
  }
  if (messageNormalise === "failure" && typeof code === "number") {
    return LIBELLES_CODE_SFTP[code] ?? `echec SFTP (code ${code})`;
  }
  if (messageNormalise === "failure") {
    return "echec SFTP (verifiez mot de passe, dossier distant et droits d'ecriture)";
  }
  return message;
}

function ajouterIndiceFinalisation(contexte: ContexteErreurSsh, detail: string): string {
  if (!contexte.operation.includes("finalisation")) {
    return detail;
  }
  if (detail.includes("echec SFTP")) {
    return `${detail} — si le fichier existe deja sur le Pi, verifiez les droits d'ecrasement`;
  }
  return detail;
}

export function formaterErreurSsh(error: unknown, contexte: ContexteErreurSsh): Error {
  const messageBrut = extraireMessageErreur(error);
  const code = extraireCodeErreur(error);
  const detail = ajouterIndiceFinalisation(contexte, detailleMessageSsh(messageBrut, code));

  const parties: string[] = [`Echec ${contexte.operation}`];
  if (contexte.hote) {
    parties.push(`vers ${contexte.hote}`);
  }
  if (contexte.cheminDistant) {
    parties.push(`(fichier: ${contexte.cheminDistant})`);
  } else if (contexte.dossierDistant) {
    parties.push(`(dossier: ${contexte.dossierDistant})`);
  }
  parties.push(`: ${detail}`);

  if (
    detail.includes("authentification") ||
    detail.includes("permission refusee") ||
    code === 3
  ) {
    parties.push(" — verifiez pi/raspberry et les droits sur le dossier skini/sons.");
  }

  return new Error(parties.join(" "));
}
