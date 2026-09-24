import type { Transfer } from "../models/Transfer";
import type { ITransferRepository } from "../interfaces/ITransferRepository";

export class TransferRegistry implements ITransferRepository {
  private readonly map = new Map<string, Transfer>();

  public save(transfer: Transfer): void {
    this.map.set(transfer.id, { ...transfer, updatedAtMs: Date.now() });
  }

  public findById(transferId: string): Transfer | undefined {
    const hit = this.map.get(transferId);
    return hit ? { ...hit } : undefined;
  }

  public delete(transferId: string): boolean {
    return this.map.delete(transferId);
  }

  public list(): Transfer[] {
    return Array.from(this.map.values()).map((item) => ({ ...item }));
  }
}
