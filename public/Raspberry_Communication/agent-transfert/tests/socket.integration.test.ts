import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { io as ioClient, type Socket } from "socket.io-client";
import { creerApplication, type ApplicationAgent } from "../src/createApp";
import { creerConfigurationParDefaut } from "../src/config/AppConfig";
import { creerLogger } from "../src/utils/logger";
import { TransferState } from "../src/models/TransferState";
import { creerScpServicePourTests } from "./helpers/scpTestHelper";

const loggerTest = creerLogger(creerConfigurationParDefaut());

function attendreEvenement<T>(
  socket: Socket,
  predicat: (payload: Record<string, unknown>) => boolean,
  timeoutMs = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off("transfer:event", ecouteur);
      reject(new Error("Timeout en attente evenement Socket.IO"));
    }, timeoutMs);

    const ecouteur = (payload: Record<string, unknown>) => {
      if (!predicat(payload)) {
        return;
      }
      clearTimeout(timer);
      socket.off("transfer:event", ecouteur);
      resolve(payload as T);
    };
    socket.on("transfer:event", ecouteur);
  });
}

describe("Socket.IO phase 4", () => {
  let agent: ApplicationAgent;
  let port: number;
  let socket: Socket;

  beforeEach(async () => {
    const tempDedie = fs.mkdtempSync(path.join(os.tmpdir(), "agent-socket-it-"));
    agent = creerApplication({ scpService: creerScpServicePourTests(loggerTest) });
    agent.config.tempDirectory = tempDedie;
    await new Promise<void>((resolve) => {
      agent.server.listen(0, () => {
        const adresse = agent.server.address();
        port = typeof adresse === "object" && adresse ? adresse.port : 3100;
        resolve();
      });
    });
    socket = ioClient(`http://127.0.0.1:${port}`, { transports: ["websocket"] });
    await new Promise<void>((resolve) => {
      socket.on("connect", () => resolve());
    });
  });

  afterEach(() => {
    socket.disconnect();
    agent.server.close();
    if (fs.existsSync(agent.config.tempDirectory)) {
      fs.rmSync(agent.config.tempDirectory, { recursive: true, force: true });
    }
  });

  it("accepte un subscribe anticipe avant creation du transfert", async () => {
    const transferId = "b2c3d4e5-f6a7-4890-b123-456789abcdef";

    const ack = await new Promise<Record<string, unknown>>((resolve) => {
      socket.once("command:ack", resolve);
      socket.once("transfer:snapshot", (snapshot) => {
        expect(snapshot.transferId).toBe(transferId);
        expect(snapshot.state).toBe(TransferState.IDLE);
      });
      socket.emit("subscribe", { transferId });
    });

    expect(ack.ok).toBe(true);

    const contenu = Buffer.from("RIFF-fake");
    const upload = await request(agent.app)
      .post("/upload")
      .set("X-Transfer-Id", transferId)
      .attach("file", contenu, "son.wav");

    expect(upload.body.transferId).toBe(transferId);
    expect(agent.transferService.obtenirTransfert(transferId)?.state).toBe(TransferState.READY);
  });

  it("renvoie un snapshot a la reconnexion (subscribe)", async () => {
    const contenu = Buffer.from("RIFF-fake-wav");
    const upload = await request(agent.app).post("/upload").attach("file", contenu, "son.wav");
    const transferId = upload.body.transferId as string;

    const snapshot = await new Promise<Record<string, unknown>>((resolve) => {
      socket.once("transfer:snapshot", resolve);
      socket.emit("subscribe", { transferId });
    });

    expect(snapshot.transferId).toBe(transferId);
    expect(snapshot.state).toBe(TransferState.READY);
    expect(snapshot.size).toBe(contenu.length);
  });

  it("envoie vers un chemin distant personnalise", async () => {
    agent.configStore.ecrire({
      sshHost: "192.168.1.74",
      sshLogin: "pi",
      privateKeyPath: "C:/fake/id_rsa",
    });

    const contenu = Buffer.from("RIFF-custom-path");
    const upload = await request(agent.app).post("/upload").attach("file", contenu, "son.wav");
    const transferId = upload.body.transferId as string;

    socket.emit("subscribe", { transferId });
    await new Promise((resolve) => setTimeout(resolve, 30));

    const cheminPersonnalise = "/home/pi/mon-dossier/custom-son.wav";
    const promesseCompleted = attendreEvenement<{ state?: string; type: string }>(
      socket,
      (event) => event.transferId === transferId && event.type === "state" && event.state === "COMPLETED"
    );

    socket.emit("command", {
      type: "startTransfer",
      transferId,
      raspberryId: 1,
      sonNumber: 1,
      remotePath: cheminPersonnalise,
    });

    await promesseCompleted;
    expect(agent.transferService.obtenirTransfert(transferId)?.remotePathFinal).toBe(cheminPersonnalise);
  });

  it("execute startTransfer (SCP mock) jusqu a COMPLETED", async () => {
    agent.configStore.ecrire({
      sshHost: "192.168.1.74",
      sshLogin: "pi",
      sshPort: 22,
      privateKeyPath: "C:/fake/id_rsa",
    });

    const contenu = Buffer.from("RIFF-fake-wav-longer");
    const upload = await request(agent.app).post("/upload").attach("file", contenu, "son.wav");
    const transferId = upload.body.transferId as string;

    socket.emit("subscribe", { transferId });
    await new Promise((resolve) => setTimeout(resolve, 30));

    const promesseCompleted = attendreEvenement<{ state?: string; type: string }>(
      socket,
      (event) => event.transferId === transferId && event.type === "state" && event.state === "COMPLETED"
    );

    socket.emit("command", {
      type: "startTransfer",
      transferId,
      raspberryId: 74,
      sonNumber: 501,
    });

    await promesseCompleted;

    const transfer = agent.transferService.obtenirTransfert(transferId);
    expect(transfer?.state).toBe(TransferState.COMPLETED);
    expect(transfer?.remoteFilename).toBe("son501.wav");
  });

  it("annule un envoi SCP en cours", async () => {
    agent.configStore.ecrire({ sshHost: "192.168.1.10", privateKeyPath: "C:/fake/id_rsa" });

    const contenu = Buffer.alloc(64 * 1024, 1);
    const upload = await request(agent.app).post("/upload").attach("file", contenu, "gros.wav");
    const transferId = upload.body.transferId as string;

    socket.emit("subscribe", { transferId });
    await new Promise((resolve) => setTimeout(resolve, 20));

    const promesseAnnule = attendreEvenement<{ state?: string; type: string }>(
      socket,
      (event) => event.transferId === transferId && event.type === "state" && event.state === "CANCELLED"
    );

    socket.emit("command", {
      type: "startTransfer",
      transferId,
      raspberryId: 10,
      sonNumber: 500,
    });
    await new Promise((resolve) => setTimeout(resolve, 25));
    socket.emit("command", { type: "cancelTransfer", transferId });

    await promesseAnnule;
    expect(agent.transferService.obtenirTransfert(transferId)?.state).toBe(TransferState.CANCELLED);
  });

  it("supprime un transfert READY", async () => {
    const contenu = Buffer.from("RIFF");
    const upload = await request(agent.app).post("/upload").attach("file", contenu, "son.wav");
    const transferId = upload.body.transferId as string;

    const ack = await new Promise<Record<string, unknown>>((resolve) => {
      socket.once("command:ack", resolve);
      socket.emit("command", { type: "deleteTransfer", transferId });
    });

    expect(ack.ok).toBe(true);
    expect(agent.transferService.obtenirTransfert(transferId)).toBeUndefined();
  });
});
