import Raspberry from "./Raspberry";
import type { TransfertDraft } from "../utils/agent-transfert/AgentTransfertHelpers";
import type { TransfertLastStatus } from "../Views/panneaux/SearchRaspberryPanneauTransfert";

export type EntreeCatalogueParc = { number: number; mac: string; ipAddress: string };
export type OscDraft = {
  address: string;
  args: string;
  port: string;
  playSonNumber?: number;
  playLevel?: number;
  playFichier?: string;
};
export type OscLastStatus = { ok: boolean; text: string; atMs: number };

/**
 * État applicatif de la fenêtre Search Raspberry (données, pas de DOM).
 */
export default class SearchRaspberryState {
  public readonly heartbeatTimeoutMs = 12000;
  /** Délai max depuis le dernier ping/ARP pour considérer le Raspberry joignable sur le réseau. */
  public readonly networkReachabilityTimeoutMs = 45000;
  public readonly reconnectDelayMs = 2000;
  public readonly wsServerPort = 8383;

  public raspberryMap = new Map<string, Raspberry>();
  public selectedRaspberryIp: string | null = null;
  public detailsVisible = false;
  public subnetPrefix = "192.168.1.";
  public activeExpectedIps = ["192.168.1.74", "192.168.1.75"];
  public oscLastStatusByIp = new Map<string, OscLastStatus>();
  public oscDraftByIp = new Map<string, OscDraft>();
  public transfertDraftByIp = new Map<string, TransfertDraft>();
  public transfertLastStatusByIp = new Map<string, TransfertLastStatus>();
  public agentTransfertActif = false;
  public readonly agentTransfertBaseUrl = "http://localhost:3100";

  public wsServerIp: string;

  constructor() {
    this.wsServerIp = window.location.hostname || "127.0.0.1";
    this.seedExpectedRaspberryList();
  }

  public upsertRaspberry(
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

  public seedExpectedRaspberryList(): void {
    this.activeExpectedIps.forEach((ip) => {
      const existing = this.raspberryMap.get(ip);
      if (existing) {
        existing.isExpected = true;
        return;
      }
      this.raspberryMap.set(
        ip,
        new Raspberry(ip, "", "", false, true, 0, "Aucun heartbeat recu", false, false, 0)
      );
    });
  }

  public isExpectedIp(ip: string): boolean {
    return this.activeExpectedIps.includes(ip);
  }

  public buildIpFromNumber(number: number): string {
    return `${this.subnetPrefix}${number}`;
  }

  public updateActiveExpectedFromNumbers(activeNumbers: number[]): void {
    if (activeNumbers.length === 0) {
      return;
    }
    const nextIps = activeNumbers.map((number) => this.buildIpFromNumber(number));
    this.appliquerListeAttendue(nextIps);
  }

  public updateActiveExpectedFromIps(ips: string[]): void {
    const nextIps = ips.filter((ip) => ip.length > 0);
    if (nextIps.length === 0) {
      return;
    }
    this.appliquerListeAttendue(nextIps);
  }

  /** IPs a parcourir pour la creation auto de pistes. */
  public lireIpsPourSynchronisationPistes(): string[] {
    if (this.activeExpectedIps.length > 0) {
      return this.activeExpectedIps;
    }
    return Array.from(this.raspberryMap.keys());
  }

  private appliquerListeAttendue(nextIps: string[]): void {
    this.raspberryMap.forEach((_raspberry, ip) => {
      if (!nextIps.includes(ip)) {
        this.raspberryMap.delete(ip);
      }
    });
    this.activeExpectedIps = nextIps;
    this.seedExpectedRaspberryList();
  }

  public mergeListenNumbers(activeNumbers: number[], catalog: EntreeCatalogueParc[]): number[] {
    const merged = new Set<number>();
    activeNumbers.forEach((number) => merged.add(number));
    catalog.forEach((entry) => merged.add(entry.number));
    return Array.from(merged).sort((a, b) => a - b);
  }

  public refreshOnlineStateFromHeartbeat(): void {
    const now = Date.now();
    this.raspberryMap.forEach((raspberry) => {
      const heartbeatRecent =
        raspberry.lastHeartbeatMs > 0 &&
        now - raspberry.lastHeartbeatMs <= this.heartbeatTimeoutMs;
      const networkRecent =
        raspberry.pingOk &&
        raspberry.arpSeen &&
        raspberry.networkCheckedAtMs > 0 &&
        now - raspberry.networkCheckedAtMs <= this.networkReachabilityTimeoutMs;

      if (heartbeatRecent) {
        raspberry.isOnline = true;
        raspberry.offlineReason = "";
      } else if (networkRecent) {
        raspberry.isOnline = true;
        raspberry.offlineReason = "Present sur le reseau (connexion WS en attente)";
      } else if (raspberry.lastHeartbeatMs > 0) {
        raspberry.isOnline = false;
        raspberry.offlineReason = `Timeout heartbeat (${Math.floor((now - raspberry.lastHeartbeatMs) / 1000)}s)`;
      } else if (raspberry.pingOk && raspberry.arpSeen) {
        raspberry.isOnline = false;
        raspberry.offlineReason = "Sondage reseau perime";
      } else {
        raspberry.isOnline = false;
        raspberry.offlineReason = "Aucun heartbeat recu";
      }

      if (raspberry.lastHeartbeatMs > 0) {
        raspberry.lastUpdateText = new Date(raspberry.lastHeartbeatMs).toLocaleTimeString();
      }
    });
  }

  public markAllRaspberriesOffline(): void {
    this.raspberryMap.forEach((raspberry) => {
      raspberry.isOnline = false;
      raspberry.offlineReason = "Pas present dans la derniere raspList";
    });
  }

  public resetSelection(): void {
    this.selectedRaspberryIp = null;
    this.detailsVisible = false;
  }
}
