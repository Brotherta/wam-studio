import type { Transfer } from "../models/Transfer";

export interface ITransferRepository {
  save(transfer: Transfer): void;
  findById(transferId: string): Transfer | undefined;
  delete(transferId: string): boolean;
  list(): Transfer[];
}
