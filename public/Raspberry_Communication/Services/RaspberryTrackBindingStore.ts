import { SON_NUMERO_DEFAUT } from "../utils/agent-transfert/AgentTransfertHelpers";
import {
  bindingDepuisPersiste,
  type RaspberryTrackBinding,
  type RaspberryTrackBindingPersiste,
} from "../Models/RaspberryTrackBinding";

/**
 * Cache local des liaisons piste ↔ Raspberry (runtime).
 * La persistance projet est geree par Loader via RaspberryTrackBindingPersiste.
 */
class RaspberryTrackBindingStore {
  private readonly parTrackId = new Map<number, RaspberryTrackBinding>();

  public reinitialiser(): void {
    this.parTrackId.clear();
  }

  public enregistrer(binding: RaspberryTrackBinding): RaspberryTrackBinding {
    this.parTrackId.set(binding.trackId, binding);
    return binding;
  }

  public enregistrerDepuisPersiste(
    trackId: number,
    donnees: RaspberryTrackBindingPersiste
  ): RaspberryTrackBinding {
    return this.enregistrer(bindingDepuisPersiste(trackId, donnees));
  }

  public retirerParTrackId(trackId: number): void {
    this.parTrackId.delete(trackId);
  }

  /** Supprime les liaisons dont la piste WAM n'existe plus. */
  public retirerBindingsOrphelins(pisteExiste: (trackId: number) => boolean): void {
    for (const trackId of this.parTrackId.keys()) {
      if (!pisteExiste(trackId)) {
        this.parTrackId.delete(trackId);
      }
    }
  }

  public trouverParTrackId(trackId: number): RaspberryTrackBinding | undefined {
    return this.parTrackId.get(trackId);
  }

  public trouverParIp(raspberryIp: string): RaspberryTrackBinding[] {
    return Array.from(this.parTrackId.values()).filter(
      (binding) => binding.raspberryIp === raspberryIp
    );
  }

  public trouverPremierParIp(raspberryIp: string): RaspberryTrackBinding | undefined {
    return this.trouverParIp(raspberryIp)[0];
  }

  public trouverPremierParRaspberryId(raspberryId: number): RaspberryTrackBinding | undefined {
    return Array.from(this.parTrackId.values()).find(
      (binding) => binding.raspberryId === raspberryId
    );
  }

  public prochainNumeroSonPourIp(raspberryIp: string): number {
    const existants = this.trouverParIp(raspberryIp);
    const numerosWam = existants
      .map((binding) => binding.sonNumber)
      .filter((numero) => numero >= SON_NUMERO_DEFAUT);
    if (numerosWam.length === 0) {
      return SON_NUMERO_DEFAUT;
    }
    return Math.max(...numerosWam) + 1;
  }

  public versPersiste(binding: RaspberryTrackBinding): RaspberryTrackBindingPersiste {
    return {
      ip: binding.raspberryIp,
      raspberryId: binding.raspberryId,
      sonNumber: binding.sonNumber,
    };
  }

  public tous(): RaspberryTrackBinding[] {
    return Array.from(this.parTrackId.values());
  }
}

export const raspberryTrackBindingStore = new RaspberryTrackBindingStore();

export function lireProchainNumeroSonPourIp(raspberryIp: string): number {
  return raspberryTrackBindingStore.prochainNumeroSonPourIp(raspberryIp);
}
