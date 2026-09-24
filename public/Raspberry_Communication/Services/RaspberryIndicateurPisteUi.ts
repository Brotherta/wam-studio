import type { RaspberryTrackBinding } from "../Models/RaspberryTrackBinding";
import { formaterNomPisteRaspberry } from "../utils/agent-transfert/AgentTransfertHelpers";
import {
  protegerNomPisteRaspberry,
  retirerProtectionNomPiste,
} from "./RaspberryNomPisteProtection";

const ATTR_RASPBERRY_LIE = "data-raspberry-lie";
const STYLE_BORDURE_LIE = "4px solid #1f8b4c";

type ElementPiste = {
  element: HTMLElement;
};

export function appliquerIndicateurRaspberry(
  piste: ElementPiste,
  binding: RaspberryTrackBinding
): void {
  const element = piste.element;
  element.style.borderLeft = STYLE_BORDURE_LIE;
  element.setAttribute(ATTR_RASPBERRY_LIE, String(binding.raspberryId));
  element.title = `Liee au Raspberry ${binding.raspberryIp} (son ${binding.sonNumber})`;
  protegerNomPisteRaspberry(piste, binding);
}

export function retirerIndicateurRaspberry(piste: ElementPiste): void {
  const element = piste.element;
  element.style.borderLeft = "";
  element.removeAttribute(ATTR_RASPBERRY_LIE);
  element.title = "";
  retirerProtectionNomPiste(piste);
}

export function texteStatutLiaisonPiste(binding: RaspberryTrackBinding): string {
  return `Piste liee : ${formaterNomPisteRaspberry(binding.raspberryId)} (son ${binding.sonNumber})`;
}
