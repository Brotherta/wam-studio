import type { MetadonneesNommageDistant } from "./Transfer";
import type { TransferState } from "./TransferState";

export type TransferSnapshot = {
  transferId: string;
  state: TransferState;
  originalFilename: string;
  storedFilename: string;
  size: number;
  errorMessage?: string;
  remoteFilename?: string;
  remotePathFinal?: string;
  nommageDistant?: MetadonneesNommageDistant;
  derniereProgression?: {
    phase: "upload" | "scp";
    current: number;
    total: number;
    percent: number;
  };
};
