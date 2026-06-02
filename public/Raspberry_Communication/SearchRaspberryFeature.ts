import DraggableWindow from "../src/Utils/DraggableWindow";
import Raspberry from "./Raspberry";
import { traiterMessageBrutServeur } from "./interface-wam-studio/messages/SearchRaspberryParseurMessagesServeur";
import { SearchRaspberryHoteApplicateurMessages } from "./interface-wam-studio/messages/SearchRaspberryHoteApplicateurMessages";
import { ajouterRaspberryManuellement, HotePanneauAjout, monterPanneauAjout } from "./interface-wam-studio/panneaux/SearchRaspberryPanneauAjout";
import {
  configurerBoiteDetails,
  HotePanneauListe,
  rafraichirDetailsSiSelection,
  rafraichirListeRaspberry,
} from "./interface-wam-studio/panneaux/SearchRaspberryPanneauListe";
import {
  appliquerEtatParcServeur,
  appliquerSelectionParc,
  EntreeCatalogueParc,
  HotePanneauParcDhcp,
  monterPanneauParcDhcp,
  reconstruireSelectParc,
  scannerFichierIni,
} from "./interface-wam-studio/panneaux/SearchRaspberryPanneauParcDhcp";
import { afficherResumeRuntime, monterPanneauStats } from "./interface-wam-studio/panneaux/SearchRaspberryPanneauStats";
import {
  afficherPanneauListe,
  HoteNavigation,
  masquerTousPanneaux,
  monterNavigationEtPanneaux,
} from "./interface-wam-studio/panneaux/SearchRaspberryNavigation";
import { lireCheminDossierDepuisChamp } from "./interface-wam-studio/utilitaires/SearchRaspberryUtilitairesOpenDhcp";
import {
  arreterConnexionWebSocket,
  demarrerConnexionWebSocket,
  envoyerMessageWebSocket,
  HoteConnexionWebSocket,
} from "./interface-wam-studio/connexion/SearchRaspberryConnexionWebSocket";
import {
  demarrerSurveillanceEtatServeur,
  HoteLancementServeur,
  lancerServeurRaspberryDepuisMenu,
  synchroniserCouleurBoutonLancement,
} from "./interface-wam-studio/connexion/SearchRaspberryLancementServeur";

export default class SearchRaspberryFeature {
  private searchWindow: HTMLDivElement;
  private launchButton: HTMLDivElement;
  private searchHeader: HTMLDivElement;
  private closeButton: HTMLButtonElement;
  private statusText: HTMLDivElement;
  private runtimeSummaryText: HTMLDivElement;
  private raspberryList: HTMLUListElement;
  private detailsBox: HTMLDivElement;
  private dragWindow: DraggableWindow;
  private socket: WebSocket | null;
  private raspberryMap: Map<string, Raspberry>;
  private selectedRaspberryIp: string | null;
  private listRefreshTimer: number | null;
  private readonly reconnectDelayMs: number;
  private readonly wsServerIp: string;
  private readonly wsServerPort: number;
  private readonly heartbeatTimeoutMs: number;
  private readonly iniPathStorageKey: string;
  private readonly defaultOpenDhcpFolder: string;
  private subnetPrefix: string;
  private activeExpectedIps: string[];
  private parcPanel: HTMLDivElement;
  private iniPathInput: HTMLInputElement;
  private parcSelect: HTMLSelectElement;
  private parcStatusText: HTMLDivElement;
  private addStatusText: HTMLDivElement;
  private addMacInput: HTMLInputElement;
  private addIpInput: HTMLInputElement;
  private navBar: HTMLDivElement;
  private listPanel: HTMLDivElement;
  private addPanel: HTMLDivElement;
  private statsPanel: HTMLDivElement;
  private navBtnList: HTMLButtonElement;
  private navBtnParc: HTMLButtonElement;
  private navBtnAdd: HTMLButtonElement;
  private navBtnStats: HTMLButtonElement;
  private activePanelId: string | null;
  private detailsVisible: boolean;
  private lastRuntimeSummaryPayload: Record<string, unknown> | null;
  private launchStatusTimer: number | null;
  private oscLastStatusByIp: Map<string, { ok: boolean; text: string; atMs: number }>;
  private oscDraftByIp: Map<string, { address: string; args: string; port: string }>;

  constructor() {
    this.searchWindow = document.getElementById("search-raspberry-window") as HTMLDivElement;
    this.launchButton = document.getElementById("launch-raspberry-btn") as HTMLDivElement;
    this.searchHeader = document.getElementById("search-raspberry-header") as HTMLDivElement;
    this.closeButton = document.getElementById("search-raspberry-close-button") as HTMLButtonElement;
    this.statusText = document.getElementById("search-raspberry-status") as HTMLDivElement;
    this.runtimeSummaryText = document.createElement("div");
    this.raspberryList = document.getElementById("search-raspberry-list") as HTMLUListElement;
    this.detailsBox = document.createElement("div");
    this.dragWindow = new DraggableWindow(this.searchHeader, this.searchWindow);
    this.socket = null;
    this.raspberryMap = new Map<string, Raspberry>();
    this.selectedRaspberryIp = null;
    this.listRefreshTimer = null;
    this.reconnectDelayMs = 2000;
    this.wsServerIp = window.location.hostname || "127.0.0.1";
    this.wsServerPort = 8383;
    this.heartbeatTimeoutMs = 12000;
    this.iniPathStorageKey = "raspberry-open-dhcp-folder-path";
    this.defaultOpenDhcpFolder = "C:/OpenDHCPServer/";
    this.subnetPrefix = "192.168.1.";
    this.activeExpectedIps = ["192.168.1.74", "192.168.1.75"];
    this.parcPanel = document.createElement("div");
    this.iniPathInput = document.createElement("input");
    this.parcSelect = document.createElement("select");
    this.parcStatusText = document.createElement("div");
    this.addStatusText = document.createElement("div");
    this.addMacInput = document.createElement("input");
    this.addIpInput = document.createElement("input");
    this.navBar = document.createElement("div");
    this.listPanel = document.createElement("div");
    this.addPanel = document.createElement("div");
    this.statsPanel = document.createElement("div");
    this.navBtnList = document.createElement("button");
    this.navBtnParc = document.createElement("button");
    this.navBtnAdd = document.createElement("button");
    this.navBtnStats = document.createElement("button");
    this.activePanelId = null;
    this.detailsVisible = false;
    this.lastRuntimeSummaryPayload = null;
    this.launchStatusTimer = null;
    this.oscLastStatusByIp = new Map();
    this.oscDraftByIp = new Map();
    this.searchWindow.style.resize = "both";
    this.searchWindow.style.overflow = "auto";
    this.searchWindow.style.minWidth = "320px";
    this.searchWindow.style.minHeight = "160px";
    monterPanneauParcDhcp(this.obtenirHoteParc(), () => scannerFichierIni(this.obtenirHoteParc()), () => appliquerSelectionParc(this.obtenirHoteParc()));
    monterPanneauAjout(this.obtenirHoteAjout(), () => ajouterRaspberryManuellement(this.obtenirHoteAjout()));
    configurerBoiteDetails({ detailsBox: this.detailsBox });
    monterPanneauStats({
      statsPanel: this.statsPanel,
      runtimeSummaryText: this.runtimeSummaryText,
      activePanelId: null,
    });
    monterNavigationEtPanneaux(this.obtenirHoteNavigation());
    this.seedExpectedRaspberryList();
    synchroniserCouleurBoutonLancement(this.obtenirHoteLancement());
    demarrerSurveillanceEtatServeur(
      this.obtenirHoteLancement(),
      2000,
      () => this.launchStatusTimer,
      (timer) => {
        this.launchStatusTimer = timer;
      }
    );
  }

  public openWindow(): void {
    this.searchWindow.hidden = false;
    masquerTousPanneaux(this.obtenirHoteNavigation());
    this.refreshOnlineStateFromHeartbeat();
    this.renderList();
    this.startListRefreshLoop();
    this.startSearch();
  }

  public async launchRuntime(): Promise<void> {
    await lancerServeurRaspberryDepuisMenu(this.obtenirHoteLancement());
  }

  public closeWindow(): void {
    this.searchWindow.hidden = true;
    masquerTousPanneaux(this.obtenirHoteNavigation());
    this.selectedRaspberryIp = null;
    this.detailsVisible = false;
    this.stopListRefreshLoop();
    this.stopSearch();
  }

  public bindCloseButton(): void {
    this.closeButton.addEventListener("click", () => {
      this.closeWindow();
    });
  }

  private startSearch(): void {
    demarrerConnexionWebSocket(this.obtenirHoteConnexion());
  }

  private stopSearch(): void {
    arreterConnexionWebSocket(this.obtenirHoteConnexion());
  }

  private sendMessage(message: Record<string, unknown> & { type: string }): boolean {
    return envoyerMessageWebSocket(this.obtenirHoteConnexion(), message);
  }

  private obtenirHoteConnexion(): HoteConnexionWebSocket {
    const vue = this;
    return {
      searchWindow: vue.searchWindow,
      wsServerIp: vue.wsServerIp,
      wsServerPort: vue.wsServerPort,
      reconnectDelayMs: vue.reconnectDelayMs,
      lireSocket: () => vue.socket,
      ecrireSocket: (socket) => {
        vue.socket = socket;
      },
      afficherStatut: (text) => vue.setStatus(text),
      lireCheminDossierIni: () => vue.getFolderPathValue(),
      traiterMessageServeur: (raw) => vue.handleServerMessage(raw),
    };
  }

  private obtenirHoteLancement(): HoteLancementServeur {
    const vue = this;
    return {
      afficherStatut: (text) => vue.setStatus(text),
      mettreCouleurBoutonLancement: (actif) => vue.updateLaunchButtonColor(actif),
      ouvrirFenetreApresLancement: () => vue.openWindow(),
    };
  }

  private setAddStatus(text: string): void {
    this.addStatusText.innerText = text;
  }

  /** Met à jour le panneau détails si l'IP correspond au Raspberry sélectionné. */
  private rafraichirPanneauDetailsSiSelectionne(ip: string): void {
    rafraichirDetailsSiSelection(this.obtenirHoteListe(), ip);
  }

  private obtenirHoteListe(): HotePanneauListe {
    const vue = this;
    return {
      raspberryMap: vue.raspberryMap,
      raspberryList: vue.raspberryList,
      detailsBox: vue.detailsBox,
      get selectedRaspberryIp() {
        return vue.selectedRaspberryIp;
      },
      set selectedRaspberryIp(value: string | null) {
        vue.selectedRaspberryIp = value;
      },
      get detailsVisible() {
        return vue.detailsVisible;
      },
      set detailsVisible(value: boolean) {
        vue.detailsVisible = value;
      },
      oscDraftByIp: vue.oscDraftByIp,
      oscLastStatusByIp: vue.oscLastStatusByIp,
      sendMessage: (message) => vue.sendMessage(message),
      afficherPanneauListe: () => vue.ensureListPanelVisible(),
      mettreAJourListe: () => vue.renderList(),
    };
  }

  private obtenirHoteParc(): HotePanneauParcDhcp {
    return {
      parcPanel: this.parcPanel,
      parcSelect: this.parcSelect,
      parcStatusText: this.parcStatusText,
      iniPathInput: this.iniPathInput,
      iniPathStorageKey: this.iniPathStorageKey,
      defaultOpenDhcpFolder: this.defaultOpenDhcpFolder,
      lireSubnetPrefix: () => this.subnetPrefix,
      ecrireSubnetPrefix: (prefix: string) => {
        this.subnetPrefix = prefix;
      },
      sendMessage: (message: Record<string, unknown> & { type: string }) => this.sendMessage(message),
      buildIpFromNumber: (number: number) => this.buildIpFromNumber(number),
      mergeListenNumbers: (activeNumbers: number[], catalog: EntreeCatalogueParc[]) =>
        this.mergeListenNumbers(activeNumbers, catalog),
      updateActiveExpectedFromNumbers: (activeNumbers: number[]) =>
        this.updateActiveExpectedFromNumbers(activeNumbers),
    };
  }

  private obtenirHoteAjout(): HotePanneauAjout {
    return {
      addPanel: this.addPanel,
      addStatusText: this.addStatusText,
      addMacInput: this.addMacInput,
      addIpInput: this.addIpInput,
      iniPathInput: this.iniPathInput,
      iniPathStorageKey: this.iniPathStorageKey,
      defaultOpenDhcpFolder: this.defaultOpenDhcpFolder,
      lireSocket: () => this.socket,
      sendMessage: (message: Record<string, unknown> & { type: string }) => this.sendMessage(message),
    };
  }

  private obtenirHoteNavigation(): HoteNavigation {
    const vue = this;
    return {
      statusText: vue.statusText,
      navBar: vue.navBar,
      navBtnList: vue.navBtnList,
      navBtnParc: vue.navBtnParc,
      navBtnAdd: vue.navBtnAdd,
      navBtnStats: vue.navBtnStats,
      listPanel: vue.listPanel,
      parcPanel: vue.parcPanel,
      addPanel: vue.addPanel,
      statsPanel: vue.statsPanel,
      raspberryList: vue.raspberryList,
      detailsBox: vue.detailsBox,
      get activePanelId() {
        return vue.activePanelId;
      },
      set activePanelId(value: string | null) {
        vue.activePanelId = value;
      },
      onAfficherListe: () => vue.renderList(),
      onAfficherStats: () => {
        vue.sendMessage({ type: "getRuntimeSummary" });
        if (vue.lastRuntimeSummaryPayload) {
          afficherResumeRuntime(vue.runtimeSummaryText, vue.lastRuntimeSummaryPayload);
        }
      },
    };
  }

  private obtenirHoteApplicateurMessages(): SearchRaspberryHoteApplicateurMessages {
    return {
      raspberryMap: this.raspberryMap,
      selectedRaspberryIp: this.selectedRaspberryIp,
      parcStatusText: this.parcStatusText,
      addMacInput: this.addMacInput,
      addIpInput: this.addIpInput,
      oscLastStatusByIp: this.oscLastStatusByIp,
      upsertRaspberry: (...args) => this.upsertRaspberry(...args),
      isExpectedIp: (ip) => this.isExpectedIp(ip),
      markAllRaspberriesOffline: () => this.markAllRaspberriesOffline(),
      storeRuntimeSummary: (payload) => this.storeRuntimeSummary(payload),
      setAddStatus: (text) => this.setAddStatus(text),
      setStatus: (text) => this.setStatus(text),
      sendMessage: (message) => this.sendMessage(message),
      rafraichirPanneauDetailsSiSelectionne: (ip) => this.rafraichirPanneauDetailsSiSelectionne(ip),
      applyParcState: (payload) => appliquerEtatParcServeur(this.obtenirHoteParc(), payload),
      renderList: () => this.renderList(),
      mergeListenNumbers: (activeNumbers, catalog) => this.mergeListenNumbers(activeNumbers, catalog),
      updateActiveExpectedFromNumbers: (activeNumbers) => this.updateActiveExpectedFromNumbers(activeNumbers),
      rebuildParcSelect: (catalog, listenNumbers) => reconstruireSelectParc(this.obtenirHoteParc(), catalog, listenNumbers),
    };
  }

  private async handleServerMessage(rawData: unknown): Promise<void> {
    await traiterMessageBrutServeur(this.obtenirHoteApplicateurMessages(), rawData);
    this.renderList();
  }

  private renderList(): void {
    this.refreshOnlineStateFromHeartbeat();
    rafraichirListeRaspberry(this.obtenirHoteListe());
  }

  private ensureListPanelVisible(): void {
    afficherPanneauListe(this.obtenirHoteNavigation());
  }

  private setStatus(text: string): void {
    this.statusText.innerText = text;
  }

  private startListRefreshLoop(): void {
    if (this.listRefreshTimer !== null) {
      return;
    }
    this.listRefreshTimer = window.setInterval(() => {
      if (this.searchWindow.hidden) {
        return;
      }
      this.renderList();
    }, 1000);
  }

  private stopListRefreshLoop(): void {
    if (this.listRefreshTimer === null) {
      return;
    }
    window.clearInterval(this.listRefreshTimer);
    this.listRefreshTimer = null;
  }

  private upsertRaspberry(
    ip: string,
    mac: string,
    info: string,
    isOnline: boolean,
    isExpected: boolean,
    lastHeartbeatMs: number,
    offlineReason: string,
    pingOk: boolean,
    arpSeen: boolean,
    networkCheckedAtMs: number
  ): void {
    const existing = this.raspberryMap.get(ip);
    if (existing) {
      existing.update(mac, info, isOnline, isExpected, lastHeartbeatMs, offlineReason, pingOk, arpSeen, networkCheckedAtMs);
      return;
    }
    this.raspberryMap.set(
      ip,
      new Raspberry(ip, mac, info, isOnline, isExpected, lastHeartbeatMs, offlineReason, pingOk, arpSeen, networkCheckedAtMs)
    );
  }

  private seedExpectedRaspberryList(): void {
    this.activeExpectedIps.forEach((ip) => {
      this.upsertRaspberry(ip, "", "", false, true, 0, "Aucun heartbeat recu", false, false, 0);
    });
  }

  private isExpectedIp(ip: string): boolean {
    return this.activeExpectedIps.includes(ip);
  }

  private buildIpFromNumber(number: number): string {
    return `${this.subnetPrefix}${number}`;
  }

  private updateActiveExpectedFromNumbers(activeNumbers: number[]): void {
    const nextIps = activeNumbers.map((number) => this.buildIpFromNumber(number));
    this.raspberryMap.forEach((_raspberry, ip) => {
      if (!nextIps.includes(ip)) {
        this.raspberryMap.delete(ip);
      }
    });
    this.activeExpectedIps = nextIps;
    this.seedExpectedRaspberryList();
  }

  private getFolderPathValue(): string {
    return lireCheminDossierDepuisChamp(this.iniPathInput, this.iniPathStorageKey, this.defaultOpenDhcpFolder);
  }
  private mergeListenNumbers(activeNumbers: number[], catalog: EntreeCatalogueParc[]): number[] {
    const merged = new Set<number>();
    activeNumbers.forEach((number) => merged.add(number));
    catalog.forEach((entry) => merged.add(entry.number));
    return Array.from(merged).sort((a, b) => a - b);
  }
  private refreshOnlineStateFromHeartbeat(): void {
    const now = Date.now();
    this.raspberryMap.forEach((raspberry) => {
      if (raspberry.lastHeartbeatMs <= 0) {
        raspberry.isOnline = false;
        raspberry.offlineReason = "Aucun heartbeat recu";
        return;
      }
      const delayMs = now - raspberry.lastHeartbeatMs;
      if (delayMs <= this.heartbeatTimeoutMs) {
        raspberry.isOnline = true;
        raspberry.offlineReason = "";
      } else {
        raspberry.isOnline = false;
        raspberry.offlineReason = `Timeout heartbeat (${Math.floor(delayMs / 1000)}s)`;
      }
      raspberry.lastUpdateText = new Date(raspberry.lastHeartbeatMs).toLocaleTimeString();
    });
  }

  private markAllRaspberriesOffline(): void {
    this.raspberryMap.forEach((raspberry) => {
      raspberry.isOnline = false;
      raspberry.offlineReason = "Pas present dans la derniere raspList";
    });
  }

  private storeRuntimeSummary(payload: Record<string, unknown>): void {
    this.lastRuntimeSummaryPayload = payload;
    if (this.activePanelId === "stats") {
      afficherResumeRuntime(this.runtimeSummaryText, payload);
    }
  }

  private updateLaunchButtonColor(isRunning: boolean): void {
    this.launchButton.style.backgroundColor = isRunning ? "#1f8b4c" : "#a53333";
  }
}
