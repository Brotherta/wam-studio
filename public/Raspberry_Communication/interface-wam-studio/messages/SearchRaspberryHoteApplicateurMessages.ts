import Raspberry from "../../Raspberry";

/**
 * Contrat minimal que SearchRaspberryFeature expose au parseur de messages serveur.
 */
export type SearchRaspberryHoteApplicateurMessages = {
  raspberryMap: Map<string, Raspberry>;
  selectedRaspberryIp: string | null;
  parcStatusText: HTMLDivElement;
  addMacInput: HTMLInputElement;
  addIpInput: HTMLInputElement;
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
  storeRuntimeSummary: (payload: Record<string, unknown>) => void;
  setAddStatus: (text: string) => void;
  setStatus: (text: string) => void;
  sendMessage: (message: Record<string, unknown> & { type: string }) => boolean;
  rafraichirPanneauDetailsSiSelectionne: (ip: string) => void;
  applyParcState: (payload: unknown) => void;
  renderList: () => void;
  mergeListenNumbers: (
    activeNumbers: number[],
    catalog: Array<{ number: number; mac: string; ipAddress: string }>
  ) => number[];
  updateActiveExpectedFromNumbers: (activeNumbers: number[]) => void;
  rebuildParcSelect: (
    catalog: Array<{ number: number; mac: string; ipAddress: string }>,
    listenNumbers: number[]
  ) => void;
};
