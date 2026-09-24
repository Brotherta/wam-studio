import type winston from "winston";
import type { IAuthenticationProvider } from "../interfaces/IAuthenticationProvider";
import type { IScpClient } from "../interfaces/IScpClient";
import { Ssh2ScpClient } from "../scp/Ssh2ScpClient";

export type OptionsEnvoiScp = {
  transferId: string;
  authProvider: IAuthenticationProvider;
  localPath: string;
  remotePathFinal: string;
  remotePathPart: string;
  remoteDirectory: string;
  tailleTotale: number;
  signal: AbortSignal;
  onProgression: (octetsTransferts: number, tailleTotale: number) => void;
  enregistrerAnnulation?: (fermerConnexion: () => void) => void;
};

export type FabriqueClientScp = (auth: IAuthenticationProvider) => IScpClient;

export class ScpService {
  constructor(
    private readonly logger: winston.Logger,
    private readonly fabriqueClientScp: FabriqueClientScp = (auth) => new Ssh2ScpClient(auth, logger)
  ) {}

  public async envoyerFichierAtomique(options: OptionsEnvoiScp): Promise<void> {
    const clientScp = this.fabriqueClientScp(options.authProvider);

    this.logger.info(
      `SCP demarre ${options.transferId}: ${options.localPath} -> ${options.remotePathFinal}`
    );

    await clientScp.uploadFichierAtomique({
      localPath: options.localPath,
      remotePathFinal: options.remotePathFinal,
      remotePathPart: options.remotePathPart,
      remoteDirectory: options.remoteDirectory,
      tailleTotale: options.tailleTotale,
      signal: options.signal,
      onProgress: (progression) => {
        options.onProgression(progression.current, progression.total);
      },
      onConnexion: (fermer) => {
        options.enregistrerAnnulation?.(fermer);
      },
    });

    if (options.signal.aborted) {
      throw new Error("Transfert SCP annule.");
    }

    this.logger.info(`SCP termine ${options.transferId}`);
  }
}
