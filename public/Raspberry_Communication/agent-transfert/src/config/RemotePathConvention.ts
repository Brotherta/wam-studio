/**
 * Convention de depot des fichiers audio sur chaque Raspberry Pi.
 *
 * Dossier : /home/pi/modulePre/PureData/compositions/skini/sons/
 * Nom Skini : son{numero}.wav  (ex. son500.wav pour WAM)
 * Variante  : son{numero}-{variante}.wav
 */

export const REMOTE_SONS_DIRECTORY = "/home/pi/modulePre/PureData/compositions/skini/sons";

/** Premier numero reserve aux sons envoyes depuis WAM Studio (Skini : /play 500). */
export const SON_NUMERO_WAM_DEFAUT = 500;

/** Les numeros 1-499 appartiennent a Skini ; WAM ne doit jamais les ecraser. */
export function estNumeroSonWamAutorise(sonNumber: number): boolean {
  return Number.isFinite(sonNumber) && sonNumber >= SON_NUMERO_WAM_DEFAUT;
}

export function validerNumeroSonWam(sonNumber: number): void {
  if (!estNumeroSonWamAutorise(sonNumber)) {
    throw new Error(
      `Numero de son ${sonNumber} interdit : WAM utilise uniquement ${SON_NUMERO_WAM_DEFAUT} et au-dela (sons Skini 1-${SON_NUMERO_WAM_DEFAUT - 1} proteges).`
    );
  }
}

export function construireNomFichierSkini(sonNumber: number, extension: string): string {
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return `son${sonNumber}${ext}`;
}

export type ParametresNomFichierDistant = {
  raspberryId: number;
  sonNumber: number;
  varianteIndex?: number;
  extension: string;
};

export function extraireExtensionDepuisNomFichier(filename: string): string {
  const point = filename.lastIndexOf(".");
  if (point <= 0 || point === filename.length - 1) {
    return ".wav";
  }
  return filename.slice(point).toLowerCase();
}

export function construireNomFichierDistant(params: ParametresNomFichierDistant): string {
  const { sonNumber, varianteIndex, extension } = params;
  validerNumeroSonWam(sonNumber);
  const variante =
    varianteIndex !== undefined && varianteIndex !== null && varianteIndex >= 1
      ? `-${varianteIndex}`
      : "";
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return `son${sonNumber}${variante}${ext}`;
}

export function construireCheminDistantFinal(nomFichier: string): string {
  return `${REMOTE_SONS_DIRECTORY}/${nomFichier}`;
}

export function construireCheminDistantPart(nomFichier: string): string {
  return `${REMOTE_SONS_DIRECTORY}/${nomFichier}.part`;
}

export type CheminsDistantResolus = {
  remotePathFinal: string;
  remotePathPart: string;
  remoteDirectory: string;
  remoteFilename: string;
};

export function validerEtNormaliserCheminDistant(chemin: string): string {
  const normalise = chemin.trim().replace(/\\/g, "/");
  if (!normalise.startsWith("/")) {
    throw new Error("Le chemin distant doit etre absolu (commencer par /).");
  }
  if (normalise.includes("..")) {
    throw new Error("Le chemin distant ne peut pas contenir ..");
  }
  const dernierSlash = normalise.lastIndexOf("/");
  if (dernierSlash <= 0 || dernierSlash === normalise.length - 1) {
    throw new Error("Le chemin distant doit inclure un dossier et un nom de fichier.");
  }
  const nomFichier = normalise.slice(dernierSlash + 1);
  if (!nomFichier || nomFichier.includes("/")) {
    throw new Error("Nom de fichier distant invalide.");
  }
  return normalise;
}

export function extraireRepertoireParent(chemin: string): string {
  const dernierSlash = chemin.lastIndexOf("/");
  return dernierSlash <= 0 ? "/" : chemin.slice(0, dernierSlash);
}

export function extraireNomFichierDepuisChemin(chemin: string): string {
  const dernierSlash = chemin.lastIndexOf("/");
  return dernierSlash < 0 ? chemin : chemin.slice(dernierSlash + 1);
}

export function construireCheminPartDepuisFinal(cheminFinal: string): string {
  return `${cheminFinal}.part`;
}

export function resoudreCheminsDistant(params: {
  raspberryId?: number;
  sonNumber?: number;
  varianteIndex?: number;
  extension: string;
  remotePath?: string;
}): CheminsDistantResolus {
  if (params.remotePath) {
    const remotePathFinal = validerEtNormaliserCheminDistant(params.remotePath);
    const remoteFilename = extraireNomFichierDepuisChemin(remotePathFinal);
    return {
      remotePathFinal,
      remotePathPart: construireCheminPartDepuisFinal(remotePathFinal),
      remoteDirectory: extraireRepertoireParent(remotePathFinal),
      remoteFilename,
    };
  }

  if (params.raspberryId === undefined || params.sonNumber === undefined) {
    throw new Error("raspberryId et sonNumber requis si remotePath est absent.");
  }

  const nomFichier = construireNomFichierDistant({
    raspberryId: params.raspberryId,
    sonNumber: params.sonNumber,
    varianteIndex: params.varianteIndex,
    extension: params.extension,
  });

  return {
    remotePathFinal: construireCheminDistantFinal(nomFichier),
    remotePathPart: construireCheminDistantPart(nomFichier),
    remoteDirectory: REMOTE_SONS_DIRECTORY,
    remoteFilename: nomFichier,
  };
}
