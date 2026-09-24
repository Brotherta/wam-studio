import {
  extraireNumeroRaspberryDepuisIp,
  lireNumeroRaspberryDepuisNomPiste,
} from "../utils/agent-transfert/AgentTransfertHelpers";

/**
 * IP .74 ↔ raspberry 74 ↔ piste « rasp 74 ».
 * Evite d'envoyer les sons de la piste 75 vers le Pi 74.
 */
export function liaisonPisteEstCoherente(params: {
  raspberryIp: string;
  raspberryId: number;
  nomPiste?: string;
}): boolean {
  const octet = extraireNumeroRaspberryDepuisIp(params.raspberryIp);
  if (octet !== undefined && octet !== params.raspberryId) {
    return false;
  }
  if (params.nomPiste) {
    const numeroNom = lireNumeroRaspberryDepuisNomPiste(params.nomPiste);
    if (numeroNom !== undefined && numeroNom !== params.raspberryId) {
      return false;
    }
  }
  return true;
}

export function bindingCibleLeRaspberry(
  binding: { raspberryIp: string; raspberryId: number },
  raspberryIp: string,
  raspberryId: number
): boolean {
  return (
    binding.raspberryIp === raspberryIp &&
    binding.raspberryId === raspberryId &&
    liaisonPisteEstCoherente({
      raspberryIp: binding.raspberryIp,
      raspberryId: binding.raspberryId,
    })
  );
}
