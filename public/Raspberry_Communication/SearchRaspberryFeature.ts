import SearchRaspberryController from "./Controllers/SearchRaspberryController";
import SearchRaspberryState from "./Models/SearchRaspberryState";
import SearchRaspberryView from "./Views/SearchRaspberryView";
import type { IWamPistesPont } from "./Interfaces/IWamPistesPont";

/**
 * Point d'entrée de la feature Search Raspberry (façade pour HostController).
 * Compose View + State + Controller comme App le fait pour le reste de WAM Studio.
 */
export default class SearchRaspberryFeature {
  private readonly controller: SearchRaspberryController;

  constructor() {
    const state = new SearchRaspberryState();
    const view = new SearchRaspberryView(state);
    this.controller = new SearchRaspberryController(view, state);
    this.controller.initialiser();
  }

  public openWindow(): void {
    this.controller.ouvrirFenetre();
  }

  public async launchRuntime(): Promise<void> {
    await this.controller.lancerRuntime();
  }

  public closeWindow(): void {
    this.controller.fermerFenetre();
  }

  public bindCloseButton(): void {
    this.controller.lierBoutonFermer();
  }

  public brancherPontPistes(pont: IWamPistesPont): void {
    this.controller.brancherPontPistes(pont);
  }

  public activerSurveillanceAutoPistes(): void {
    this.controller.activerSurveillanceAutoPistes();
  }

  public synchroniserPistesRaspberry(): void {
    void this.controller.synchroniserPistesPourRaspberryEnLigne();
  }
}
