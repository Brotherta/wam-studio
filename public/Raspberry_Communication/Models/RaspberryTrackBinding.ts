/**
 * Liaison entre une piste WAM Studio et un Raspberry Pi du parc.
 */
import { SON_NUMERO_DEFAUT } from "../utils/agent-transfert/AgentTransfertHelpers";

export type RaspberryTrackBinding = {
  trackId: number;
  raspberryIp: string;
  raspberryId: number;
  sonNumber: number;
  /** false = piste deliee : nom libre, ignoree par le sequenceur OSC. */
  liee: boolean;
};

export type RaspberryTrackBindingPersiste = {
  ip: string;
  raspberryId: number;
  sonNumber: number;
  liee?: boolean;
};

export function creerBinding(
  trackId: number,
  raspberryIp: string,
  raspberryId: number,
  sonNumber: number,
  liee = true
): RaspberryTrackBinding {
  return { trackId, raspberryIp, raspberryId, sonNumber, liee };
}

export function bindingDepuisPersiste(
  trackId: number,
  donnees: RaspberryTrackBindingPersiste
): RaspberryTrackBinding {
  return creerBinding(
    trackId,
    donnees.ip,
    donnees.raspberryId,
    donnees.sonNumber ?? SON_NUMERO_DEFAUT,
    donnees.liee !== false
  );
}
