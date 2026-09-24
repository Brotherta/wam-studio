import type winston from "winston";
import type { IAuthenticationProvider } from "../../src/interfaces/IAuthenticationProvider";
import type { IScpClient } from "../../src/interfaces/IScpClient";
import { ScpService } from "../../src/services/ScpService";

/** Client SCP factice pour les tests d'integration sans Raspberry reel. */
export function creerScpServicePourTests(logger: winston.Logger): ScpService {
  const fabrique: (auth: IAuthenticationProvider) => IScpClient = () => ({
    uploadFichierAtomique: async (params) => {
      params.onConnexion?.(() => undefined);
      const total = params.tailleTotale > 0 ? params.tailleTotale : 100;
      const etapes = 6;
      for (let etape = 1; etape <= etapes; etape += 1) {
        if (params.signal?.aborted) {
          throw new Error("Transfert SCP annule.");
        }
        await new Promise((resolve) => setTimeout(resolve, 12));
        params.onProgress({
          current: Math.min(total, Math.floor((total * etape) / etapes)),
          total,
        });
      }
    },
  });
  return new ScpService(logger, fabrique);
}
