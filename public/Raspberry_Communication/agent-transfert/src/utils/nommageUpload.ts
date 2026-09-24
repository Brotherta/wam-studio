import type { IncomingHttpHeaders } from "http";
import {
  construireNomFichierDistant,
  extraireExtensionDepuisNomFichier,
  resoudreCheminsDistant,
  type CheminsDistantResolus,
} from "../config/RemotePathConvention";
import type { MetadonneesNommageDistant } from "../models/Transfer";

export type NommageUploadDemande = MetadonneesNommageDistant;

function lireEntierPositif(entete: string | string[] | undefined): number | undefined {
  const brut = Array.isArray(entete) ? entete[0] : entete;
  if (typeof brut !== "string" || !brut.trim()) {
    return undefined;
  }
  const valeur = Number.parseInt(brut.trim(), 10);
  return Number.isFinite(valeur) && valeur >= 1 ? valeur : undefined;
}

/** Lit raspberryId / sonNumber / varianteIndex depuis les en-tetes HTTP de l'upload. */
export function lireNommageDepuisEntetesUpload(
  entetes: IncomingHttpHeaders
): NommageUploadDemande | undefined {
  const raspberryId = lireEntierPositif(entetes["x-raspberry-id"]);
  const sonNumber = lireEntierPositif(entetes["x-son-number"]);
  if (raspberryId === undefined || sonNumber === undefined) {
    return undefined;
  }
  const varianteBrute = lireEntierPositif(entetes["x-variante-index"]);
  return {
    raspberryId,
    sonNumber,
    varianteIndex: varianteBrute,
  };
}

export function resoudreNomFichierStocke(
  nommage: NommageUploadDemande,
  nomFichierOriginal: string
): string {
  const extension = extraireExtensionDepuisNomFichier(nomFichierOriginal);
  return construireNomFichierDistant({
    raspberryId: nommage.raspberryId,
    sonNumber: nommage.sonNumber,
    varianteIndex: nommage.varianteIndex,
    extension,
  });
}

export function resoudreCheminsDepuisNommageUpload(
  nommage: NommageUploadDemande,
  nomFichierOriginal: string
): { nomFichierStocke: string; chemins: CheminsDistantResolus } {
  const extension = extraireExtensionDepuisNomFichier(nomFichierOriginal);
  const nomFichierStocke = construireNomFichierDistant({
    raspberryId: nommage.raspberryId,
    sonNumber: nommage.sonNumber,
    varianteIndex: nommage.varianteIndex,
    extension,
  });
  const chemins = resoudreCheminsDistant({
    raspberryId: nommage.raspberryId,
    sonNumber: nommage.sonNumber,
    varianteIndex: nommage.varianteIndex,
    extension,
  });
  return { nomFichierStocke, chemins };
}
