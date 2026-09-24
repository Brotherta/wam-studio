import type { Server as SocketServer, Socket } from "socket.io";

import type { EvenementSocket, ISocketNotifier } from "../interfaces/ISocketNotifier";

import type { TransferSnapshot } from "../models/TransferSnapshot";



export class SocketService implements ISocketNotifier {

  constructor(private readonly io: SocketServer) {}



  private nomSalle(transferId: string): string {

    return `transfer:${transferId}`;

  }



  public inscrireSocket(socket: Socket, transferId: string): void {

    void socket.join(this.nomSalle(transferId));

  }



  public desinscrireSocket(socket: Socket, transferId: string): void {

    void socket.leave(this.nomSalle(transferId));

  }



  public envoyerSnapshot(socket: Socket, snapshot: TransferSnapshot): void {

    socket.emit("transfer:snapshot", snapshot);

  }



  public emit(transferId: string, event: EvenementSocket): void {

    const enveloppe = { transferId, ...event };

    this.io.to(this.nomSalle(transferId)).emit("transfer:event", enveloppe);

    this.io.emit("transfer:event", enveloppe);

  }



  public emitGlobal(event: EvenementSocket): void {

    this.io.emit("agent:event", event);

  }

}


