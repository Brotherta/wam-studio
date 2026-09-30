import DraggableWindow from "../../src/Utils/DraggableWindow";
import { configurerBoiteDetails } from "./panneaux/SearchRaspberryPanneauListe";
import { HoteNavigation, monterPanneauListePrincipal } from "./panneaux/SearchRaspberryNavigation";
import SearchRaspberryState from "../Models/SearchRaspberryState";
import SearchRaspberryFenetreTransfert from "./SearchRaspberryFenetreTransfert";

/**
 * Vue de la fenêtre Search Raspberry : références DOM et affichage.
 */
export default class SearchRaspberryView {
  public searchWindow: HTMLDivElement;
  public launchButton: HTMLDivElement;
  public searchHeader: HTMLDivElement;
  public closeButton: HTMLButtonElement;
  public statusText: HTMLDivElement;
  public raspberryList: HTMLUListElement;
  public detailsBox: HTMLDivElement;
  public listPanel: HTMLDivElement;

  public readonly dragWindow: DraggableWindow;
  public readonly fenetreTransfert: SearchRaspberryFenetreTransfert;

  constructor(private readonly state: SearchRaspberryState) {
    this.searchWindow = document.getElementById("search-raspberry-window") as HTMLDivElement;
    this.launchButton = document.getElementById("launch-raspberry-btn") as HTMLDivElement;
    this.searchHeader = document.getElementById("search-raspberry-header") as HTMLDivElement;
    this.closeButton = document.getElementById("search-raspberry-close-button") as HTMLButtonElement;
    this.statusText = document.getElementById("search-raspberry-status") as HTMLDivElement;
    this.raspberryList = document.getElementById("search-raspberry-list") as HTMLUListElement;
    this.detailsBox = document.createElement("div");
    this.listPanel = document.createElement("div");

    this.dragWindow = new DraggableWindow(this.searchHeader, this.searchWindow);
    this.fenetreTransfert = new SearchRaspberryFenetreTransfert();
    this.configurerFenetre();
    configurerBoiteDetails({ detailsBox: this.detailsBox });
  }

  public monterInterfaceListe(hoteNavigation: HoteNavigation): void {
    monterPanneauListePrincipal(hoteNavigation);
  }

  public afficherFenetre(): void {
    this.searchWindow.hidden = false;
  }

  public masquerFenetre(): void {
    this.searchWindow.hidden = true;
  }

  public estFenetreVisible(): boolean {
    return !this.searchWindow.hidden;
  }

  public definirStatut(text: string): void {
    this.statusText.innerText = text;
  }

  public mettreCouleurBoutonLancement(actif: boolean): void {
    this.launchButton.style.backgroundColor = actif ? "#1f8b4c" : "#a53333";
  }

  public lierBoutonFermer(onFermer: () => void): void {
    this.closeButton.addEventListener("click", onFermer);
  }

  private configurerFenetre(): void {
    this.searchWindow.style.resize = "both";
    this.searchWindow.style.overflow = "auto";
    this.searchWindow.style.minWidth = "320px";
    this.searchWindow.style.minHeight = "160px";
  }
}
