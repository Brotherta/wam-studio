import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { creerApplication, type ApplicationAgent } from "../src/createApp";
import { TransferState } from "../src/models/TransferState";

describe("POST /upload", () => {
  let agent: ApplicationAgent;
  let ancienTemp: string;

  beforeEach(() => {
    const tempDedie = fs.mkdtempSync(path.join(os.tmpdir(), "agent-upload-it-"));
    agent = creerApplication();
    ancienTemp = agent.config.tempDirectory;
    agent.config.tempDirectory = tempDedie;
  });

  afterEach(() => {
    agent.server.close();
    if (fs.existsSync(agent.config.tempDirectory)) {
      fs.rmSync(agent.config.tempDirectory, { recursive: true, force: true });
    }
    agent.config.tempDirectory = ancienTemp;
  });

  it("renomme le fichier a l'upload si les en-tetes de nommage sont fournis", async () => {
    const contenu = Buffer.from("RIFF-fake-wav-content");
    const transferId = "b2c3d4e5-f6a7-4890-b123-456789abcdef";

    const response = await request(agent.app)
      .post("/upload")
      .set("X-Transfer-Id", transferId)
      .set("X-Raspberry-Id", "75")
      .set("X-Son-Number", "500")
      .attach("file", contenu, "ma-boucle.wav");

    expect(response.status).toBe(200);
    expect(response.body.filename).toBe("ma-boucle.wav");
    expect(response.body.storedFilename).toBe("son500.wav");

    const transfer = agent.transferService.obtenirTransfert(transferId);
    expect(transfer?.storedFilename).toBe("son500.wav");
    expect(transfer?.remotePathFinal).toBe(
      "/home/pi/modulePre/PureData/compositions/skini/sons/son500.wav"
    );
    expect(transfer?.localPath).toMatch(/son500\.wav$/);
  });

  it("accepte un fichier wav et passe en READY", async () => {
    const contenu = Buffer.from("RIFF-fake-wav-content");
    const transferId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

    const response = await request(agent.app)
      .post("/upload")
      .set("X-Transfer-Id", transferId)
      .attach("file", contenu, "test-son.wav");

    expect(response.status).toBe(200);
    expect(response.body.transferId).toBe(transferId);
    expect(response.body.filename).toBe("test-son.wav");
    expect(response.body.size).toBe(contenu.length);

    const transfer = agent.transferService.obtenirTransfert(response.body.transferId);
    expect(transfer?.state).toBe(TransferState.READY);
    expect(transfer?.localPath).toBeTruthy();
    expect(fs.existsSync(transfer!.localPath)).toBe(true);
  });

  it("refuse une extension non audio", async () => {
    const response = await request(agent.app)
      .post("/upload")
      .attach("file", Buffer.from("texte"), "document.txt");

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Extension/);
  });

  it("refuse une requete sans fichier", async () => {
    const response = await request(agent.app).post("/upload");
    expect(response.status).toBe(400);
  });
});
