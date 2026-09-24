import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import type { RaspberryTrackBinding } from "../Models/RaspberryTrackBinding";
import {
  lireProchainNumeroSonPourIp,
  raspberryTrackBindingStore,
} from "./RaspberryTrackBindingStore";
import { bindingCibleLeRaspberry, liaisonPisteEstCoherente } from "./RaspberryPisteCoherence";
import { SON_NUMERO_DEFAUT } from "../utils/agent-transfert/AgentTransfertHelpers";

export type ResultatLiaisonPiste =
  | { type: "cree"; binding: RaspberryTrackBinding; nomPiste: string }
  | { type: "existant"; binding: RaspberryTrackBinding; nomPiste: string }
  | { type: "relie"; binding: RaspberryTrackBinding; nomPiste: string };

/**
 * Orchestration metier : creer ou retrouver une piste liee a un Raspberry.
 */
export default class RaspberryPisteLiaisonService {
  constructor(private readonly pont: IWamPistesPont) {}

  public async creerOuAllerVersPiste(
    raspberryIp: string,
    raspberryId: number
  ): Promise<ResultatLiaisonPiste> {
    const resultat = await this.assurerPistePourRaspberry(raspberryIp, raspberryId);
    if (resultat.type === "existant") {
      this.pont.focusPiste(resultat.binding.trackId);
    }
    return resultat;
  }

  /**
   * Garantit une piste pour un Raspberry en ligne :
   * - liaison valide existante → rien
   * - piste « rasp N » sans liaison → relie
   * - sinon → cree
   */
  public async assurerPistePourRaspberry(
    raspberryIp: string,
    raspberryId: number
  ): Promise<ResultatLiaisonPiste> {
    this.nettoyerBindingsOrphelins();

    const bindingExistant = this.lireBindingCoherent(raspberryIp, raspberryId);
    if (bindingExistant) {
      return {
        type: "existant",
        binding: bindingExistant,
        nomPiste:
          this.pont.lireNomPiste(bindingExistant.trackId) ??
          `rasp ${bindingExistant.raspberryId}`,
      };
    }

    const pisteIdParNom = this.pont.trouverPisteIdParNumeroRaspberry(raspberryId);
    if (pisteIdParNom !== undefined) {
      const relie = this.pont.lierPisteExistante(
        pisteIdParNom,
        raspberryIp,
        raspberryId,
        SON_NUMERO_DEFAUT
      );
      return { type: "relie", binding: relie.binding, nomPiste: relie.nomPiste };
    }

    return this.creerPiste(raspberryIp, raspberryId);
  }

  /** @deprecated Utiliser assurerPistePourRaspberry */
  public async creerSiAbsent(
    raspberryIp: string,
    raspberryId: number
  ): Promise<ResultatLiaisonPiste | null> {
    const resultat = await this.assurerPistePourRaspberry(raspberryIp, raspberryId);
    if (!resultat || resultat.type === "existant") {
      return null;
    }
    return resultat;
  }

  private nettoyerBindingsOrphelins(): void {
    raspberryTrackBindingStore.retirerBindingsOrphelins((trackId) =>
      this.pont.pisteExiste(trackId)
    );
  }

  private async creerPiste(
    raspberryIp: string,
    raspberryId: number
  ): Promise<ResultatLiaisonPiste> {
    const sonNumber = lireProchainNumeroSonPourIp(raspberryIp);
    const cree = await this.pont.creerPistePourRaspberry(
      raspberryIp,
      raspberryId,
      sonNumber
    );

    return {
      type: "cree",
      binding: cree.binding,
      nomPiste: cree.nomPiste,
    };
  }

  /**
   * Retrouve la piste deja liee, ou une piste nommee « rasp 74 » / « rasp74 ».
   * Ne cree pas de piste vide.
   */
  public trouverBindingPourEnvoi(
    raspberryIp: string,
    raspberryId: number
  ): RaspberryTrackBinding | undefined {
    const existant = this.lireBindingCoherent(raspberryIp, raspberryId);
    if (existant) {
      return existant;
    }
    const pisteId = this.pont.trouverPisteIdParNumeroRaspberry(raspberryId);
    if (pisteId === undefined) {
      return undefined;
    }
    return this.pont.lierPisteExistante(
      pisteId,
      raspberryIp,
      raspberryId,
      SON_NUMERO_DEFAUT
    ).binding;
  }

  public lireTrackIdPourEnvoi(
    raspberryIp: string,
    raspberryId: number
  ): number | undefined {
    const binding = this.lireBindingCoherent(raspberryIp, raspberryId);
    if (binding) {
      return binding.trackId;
    }
    const pisteId = this.pont.trouverPisteIdParNumeroRaspberry(raspberryId);
    if (pisteId !== undefined) {
      return pisteId;
    }
    return undefined;
  }

  public pistePresentePourRaspberry(raspberryId: number, raspberryIp: string): boolean {
    const binding = this.lireBindingCoherent(raspberryIp, raspberryId);
    if (binding) {
      return true;
    }
    const pisteId = this.pont.trouverPisteIdParNumeroRaspberry(raspberryId);
    return pisteId !== undefined;
  }

  public lireBindingPourIp(raspberryIp: string): RaspberryTrackBinding | undefined {
    this.nettoyerBindingsOrphelins();
    const binding = raspberryTrackBindingStore.trouverPremierParIp(raspberryIp);
    if (!binding) {
      return undefined;
    }
    if (!this.pont.pisteExiste(binding.trackId)) {
      raspberryTrackBindingStore.retirerParTrackId(binding.trackId);
      return undefined;
    }
    const nomPiste = this.pont.lireNomPiste(binding.trackId);
    if (
      !liaisonPisteEstCoherente({
        raspberryIp: binding.raspberryIp,
        raspberryId: binding.raspberryId,
        nomPiste,
      })
    ) {
      return undefined;
    }
    return binding;
  }

  private lireBindingCoherent(
    raspberryIp: string,
    raspberryId: number
  ): RaspberryTrackBinding | undefined {
    this.nettoyerBindingsOrphelins();
    const parIp = raspberryTrackBindingStore.trouverPremierParIp(raspberryIp);
    if (parIp && this.pont.pisteExiste(parIp.trackId) && bindingCibleLeRaspberry(parIp, raspberryIp, raspberryId)) {
      const nomPiste = this.pont.lireNomPiste(parIp.trackId);
      if (liaisonPisteEstCoherente({ raspberryIp, raspberryId, nomPiste })) {
        return parIp;
      }
    }
    const parId = raspberryTrackBindingStore.trouverPremierParRaspberryId(raspberryId);
    if (
      parId &&
      this.pont.pisteExiste(parId.trackId) &&
      bindingCibleLeRaspberry(parId, raspberryIp, raspberryId)
    ) {
      return parId;
    }
    return undefined;
  }
}
