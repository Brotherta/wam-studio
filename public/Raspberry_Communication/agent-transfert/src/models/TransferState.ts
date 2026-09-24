export enum TransferState {
  IDLE = "IDLE",
  RECEIVING = "RECEIVING",
  VERIFYING = "VERIFYING",
  READY = "READY",
  SENDING = "SENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

const TRANSITIONS_VALIDES: Record<TransferState, TransferState[]> = {
  [TransferState.IDLE]: [TransferState.RECEIVING, TransferState.FAILED, TransferState.CANCELLED],
  [TransferState.RECEIVING]: [TransferState.VERIFYING, TransferState.FAILED, TransferState.CANCELLED],
  [TransferState.VERIFYING]: [TransferState.READY, TransferState.FAILED, TransferState.CANCELLED],
  [TransferState.READY]: [TransferState.SENDING, TransferState.FAILED, TransferState.CANCELLED],
  [TransferState.SENDING]: [TransferState.COMPLETED, TransferState.FAILED, TransferState.CANCELLED],
  [TransferState.COMPLETED]: [],
  [TransferState.FAILED]: [],
  [TransferState.CANCELLED]: [],
};

export function transitionAutorisee(de: TransferState, vers: TransferState): boolean {
  return TRANSITIONS_VALIDES[de].includes(vers);
}
