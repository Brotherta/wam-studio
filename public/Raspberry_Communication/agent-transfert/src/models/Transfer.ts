import { TransferState } from "./TransferState";

export type MetadonneesNommageDistant = {
  raspberryId: number;
  sonNumber: number;
  varianteIndex?: number;
};

export type CibleSshTransfert = {
  host: string;
  port: number;
  username: string;
};

export type Transfer = {
  id: string;
  originalFilename: string;
  storedFilename: string;
  size: number;
  localPath: string;
  state: TransferState;
  nommageDistant?: MetadonneesNommageDistant;
  cibleSsh?: CibleSshTransfert;
  remoteFilename?: string;
  remotePathFinal?: string;
  remotePathPart?: string;
  errorMessage?: string;
  createdAtMs: number;
  updatedAtMs: number;
};

export function creerTransfertVide(id: string, originalFilename: string): Transfer {
  const now = Date.now();
  return {
    id,
    originalFilename,
    storedFilename: "",
    size: 0,
    localPath: "",
    state: TransferState.IDLE,
    createdAtMs: now,
    updatedAtMs: now,
  };
}
