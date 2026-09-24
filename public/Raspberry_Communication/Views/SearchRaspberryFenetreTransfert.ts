import DraggableWindow from "../../src/Utils/DraggableWindow";
import Raspberry from "../Models/Raspberry";
import { formaterNomAffichageRaspberry } from "../utils/agent-transfert/AgentTransfertHelpers";
import {
  construirePanneauTransfert,
  HotePanneauTransfert,
} from "./panneaux/SearchRaspberryPanneauTransfert";

/**
 * Fenêtre flottante dédiée à l'envoi de fichiers audio vers un Raspberry.
 * Créée dynamiquement (sans modifier index.html).
 */
export default class SearchRaspberryFenetreTransfert {
  public readonly window: HTMLDivElement;
  public readonly header: HTMLDivElement;
  public readonly body: HTMLDivElement;
  public readonly title: HTMLSpanElement;
  public readonly dragWindow: DraggableWindow;

  private ipCourante: string | null = null;

  constructor() {
    this.window = document.createElement("div");
    this.window.id = "search-raspberry-transfert-window";
    this.window.className = "floating-window";
    this.window.hidden = true;
    this.window.style.resize = "both";
    this.window.style.overflow = "auto";
    this.window.style.minWidth = "380px";
    this.window.style.minHeight = "300px";
    this.window.style.maxWidth = "540px";
    this.window.style.top = "90px";
    this.window.style.left = "430px";
    this.window.style.zIndex = "25";

    this.header = document.createElement("div");
    this.header.className = "header-window";

    this.title = document.createElement("span");
    this.title.className = "title";
    this.title.innerText = "Transfert audio";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "close-button";
    closeButton.innerText = "X";
    closeButton.addEventListener("click", () => this.masquer());

    this.header.appendChild(this.title);
    this.header.appendChild(closeButton);

    this.body = document.createElement("div");
    this.body.className = "settings-body";
    this.body.style.color = "#f1f1f1";

    this.window.appendChild(this.header);
    this.window.appendChild(this.body);
    document.body.appendChild(this.window);

    this.dragWindow = new DraggableWindow(this.header, this.window);
  }

  public lireIpCourante(): string | null {
    return this.ipCourante;
  }

  public estVisible(): boolean {
    return !this.window.hidden;
  }

  public interactionEnCours(): boolean {
    const active = document.activeElement as HTMLElement | null;
    if (!active || !this.body.contains(active)) {
      return false;
    }
    const tag = active.tagName.toUpperCase();
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  }

  public ouvrir(raspberry: Raspberry, hote: HotePanneauTransfert): void {
    this.ipCourante = raspberry.ip;
    this.mettreAJourTitre(raspberry);
    this.monterContenu(raspberry, hote);
    this.window.hidden = false;
  }

  public masquer(): void {
    this.window.hidden = true;
    this.body.innerHTML = "";
    this.ipCourante = null;
  }

  public rafraichir(
    raspberry: Raspberry,
    hote: HotePanneauTransfert,
    options?: { forcer?: boolean }
  ): void {
    if (!this.estVisible() || this.ipCourante !== raspberry.ip) {
      return;
    }
    if (!options?.forcer && this.interactionEnCours()) {
      this.mettreAJourTitre(raspberry);
      return;
    }
    this.monterContenu(raspberry, hote);
  }

  public lireConteneurPanel(ip: string): Element | null {
    return this.body.querySelector(`[data-transfert-panel="${ip}"]`);
  }

  private mettreAJourTitre(raspberry: Raspberry): void {
    const onlineText = raspberry.isOnline ? "En ligne" : "Hors ligne";
    const nom = formaterNomAffichageRaspberry(raspberry.ip, raspberry.info);
    this.title.innerText = `Transfert — ${nom} (${onlineText})`;
  }

  private monterContenu(raspberry: Raspberry, hote: HotePanneauTransfert): void {
    this.body.innerHTML = "";
    const sousTitre = document.createElement("div");
    sousTitre.style.fontSize = "12px";
    sousTitre.style.opacity = "0.85";
    sousTitre.style.marginBottom = "8px";
    sousTitre.innerText = `Destination : ${raspberry.ip}`;
    this.body.appendChild(sousTitre);
    this.body.appendChild(construirePanneauTransfert(hote, raspberry));
  }
}
