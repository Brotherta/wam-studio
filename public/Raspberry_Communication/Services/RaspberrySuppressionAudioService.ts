import type Raspberry from "../Models/Raspberry";
import { formaterNomAffichageRaspberry } from "../utils/agent-transfert/AgentTransfertHelpers";

export type CibleSuppressionAudio = {
  ip: string;
  nomAffichage: string;
  enLigne: boolean;
};

export type ResultatSuppressionAudio = {
  ip: string;
  nomAffichage: string;
  ok: boolean;
  message: string;
  supprimes: string[];
};

type ListerFichiersFn = (
  ip: string
) => Promise<{ ok: true; fichiers: string[] } | { ok: false; error: string }>;

type SupprimerFichiersFn = (
  ip: string,
  fichiers: string[]
) => Promise<
  | { ok: true; supprimes: string[]; ignores: string[] }
  | { ok: false; error: string }
>;

/**
 * Liste et supprime des fichiers audio dans sons/ sur les Raspberry en ligne.
 */
export default class RaspberrySuppressionAudioService {
  constructor(
    private readonly listerFichiers: ListerFichiersFn,
    private readonly supprimerFichiers: SupprimerFichiersFn
  ) {}

  public listerCibles(raspberries: Raspberry[]): CibleSuppressionAudio[] {
    return [...raspberries]
      .sort((a, b) => a.ip.localeCompare(b.ip, undefined, { numeric: true }))
      .map((raspberry) => ({
        ip: raspberry.ip,
        nomAffichage: formaterNomAffichageRaspberry(raspberry.ip, raspberry.info),
        enLigne: raspberry.isOnline,
      }));
  }

  public async listerSons(ip: string): Promise<
    | { ok: true; fichiers: string[] }
    | { ok: false; error: string }
  > {
    const liste = await this.listerFichiers(ip);
    if (!liste.ok) {
      return liste;
    }
    return { ok: true, fichiers: liste.fichiers };
  }

  public async supprimerSons(
    ip: string,
    nomAffichage: string,
    fichiers: string[]
  ): Promise<ResultatSuppressionAudio> {
    if (fichiers.length === 0) {
      return {
        ip,
        nomAffichage,
        ok: false,
        message: "Cochez au moins un son a supprimer.",
        supprimes: [],
      };
    }

    const resultat = await this.supprimerFichiers(ip, fichiers);
    if (!resultat.ok) {
      return {
        ip,
        nomAffichage,
        ok: false,
        message: resultat.error,
        supprimes: [],
      };
    }

    const ignores =
      resultat.ignores.length > 0
        ? ` (${resultat.ignores.length} deja absent(s) ou ignore(s))`
        : "";
    return {
      ip,
      nomAffichage,
      ok: resultat.supprimes.length > 0,
      message:
        resultat.supprimes.length > 0
          ? `${resultat.supprimes.length} son(s) supprime(s)${ignores}.`
          : "Aucun fichier supprime.",
      supprimes: resultat.supprimes,
    };
  }
}
