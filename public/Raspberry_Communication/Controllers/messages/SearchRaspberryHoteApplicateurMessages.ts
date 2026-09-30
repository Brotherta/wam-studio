import Raspberry from "../../Models/Raspberry";

/**
 * Contrat minimal que le contrôleur expose au parseur de messages serveur.
 */
export type SearchRaspberryHoteApplicateurMessages = {
  raspberryMap: Map<string, Raspberry>;
  selectedRaspberryIp: string | null;
  oscLastStatusByIp: Map<string, { ok: boolean; text: string; atMs: number }>;
  upsertRaspberry: (
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
  ) => void;
  isExpectedIp: (ip: string) => boolean;
  markAllRaspberriesOffline: () => void;
  setStatus: (text: string) => void;
  sendMessage: (message: Record<string, unknown> & { type: string }) => boolean;
  rafraichirPanneauDetailsSiSelectionne: (ip: string) => void;
  synchroniserEtatParc: (payload: Record<string, unknown>) => void;
  synchroniserListeAttendueDepuisIps: (ips: string[]) => void;
  renderList: () => void;
  mettreAJourEtatAgentTransfert: (running: boolean, message?: string) => void;
};
