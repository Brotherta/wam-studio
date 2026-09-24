import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it, vi } from "vitest";
import type { IAuthenticationProvider } from "../src/interfaces/IAuthenticationProvider";
import type { IScpClient } from "../src/interfaces/IScpClient";
import { creerLogger } from "../src/utils/logger";
import { creerConfigurationParDefaut } from "../src/config/AppConfig";
import { ScpService } from "../src/services/ScpService";

describe("ScpService", () => {
  it("delegue l'upload atomique au client SCP injecte", async () => {
    const config = creerConfigurationParDefaut();
    const logger = creerLogger(config);
    const progression: number[] = [];
    const mockClient: IScpClient = {
      uploadFichierAtomique: vi.fn(async (params) => {
        params.onProgress({ current: 50, total: 100 });
        params.onConnexion?.(() => undefined);
        progression.push(params.tailleTotale);
      }),
    };
    const authFactice: IAuthenticationProvider = { connect: vi.fn() as never };
    const service = new ScpService(logger, () => mockClient);

    const fichierLocal = path.join(os.tmpdir(), `scp-test-${Date.now()}.wav`);
    fs.writeFileSync(fichierLocal, Buffer.from("test"));

    await service.envoyerFichierAtomique({
      transferId: "t1",
      authProvider: authFactice,
      localPath: fichierLocal,
      remotePathFinal: "/home/pi/modulePre/PureData/compositions/skini/sons/son500.wav",
      remotePathPart: "/home/pi/modulePre/PureData/compositions/skini/sons/son500.wav.part",
      remoteDirectory: "/home/pi/modulePre/PureData/compositions/skini/sons",
      tailleTotale: 4,
      signal: new AbortController().signal,
      onProgression: (courant) => progression.push(courant),
    });

    expect(mockClient.uploadFichierAtomique).toHaveBeenCalledOnce();
    expect(progression).toContain(4);
    expect(progression).toContain(50);
    fs.unlinkSync(fichierLocal);
  });
});
