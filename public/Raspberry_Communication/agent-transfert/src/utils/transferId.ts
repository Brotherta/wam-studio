import { v4 as uuidv4 } from "uuid";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function estUuidV4(valeur: string): boolean {
  return UUID_V4.test(valeur);
}

export function resoudreTransferIdDepuisEntete(entete: string | string[] | undefined): string {
  const brut = Array.isArray(entete) ? entete[0] : entete;
  if (typeof brut === "string" && estUuidV4(brut.trim())) {
    return brut.trim();
  }
  return uuidv4();
}
