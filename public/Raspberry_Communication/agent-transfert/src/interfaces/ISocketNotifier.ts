export type EvenementSocket =
  | { type: "progress"; phase: "upload" | "scp"; current: number; total: number; percent: number; speed: number; remainingSeconds: number }
  | { type: "state"; state: string }
  | { type: "completed" }
  | { type: "error"; message: string }
  | { type: "log"; message: string };

export interface ISocketNotifier {
  emit(transferId: string, event: EvenementSocket): void;
  emitGlobal(event: EvenementSocket): void;
}
