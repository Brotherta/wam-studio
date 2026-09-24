import type Raspberry from "../Models/Raspberry";
import {
  extraireNumeroRaspberryDepuisIp,
  formaterNomAffichageRaspberry,
  formaterNomPisteRaspberry,
} from "../utils/agent-transfert/AgentTransfertHelpers";
import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import RaspberryPisteLiaisonService from "./RaspberryPisteLiaisonService";
import { extraireNumeroSonOscDepuisFichier } from "../utils/osc/OscPlayHelpers";
import { nommerRegionApresEnregistrement } from "./RaspberryNomRegionService";
import { lireLibelleSon } from "./RaspberryLibellesSonsStore";

export type CibleImportAudio = {
  ip: string;
  raspberryId: number;
  nomAffichage: string;
  nomPiste: string;
  enLigne: boolean;
  pistePresente: boolean;
};

export type ResultatImportAudio = {
  ip: string;
  nomAffichage: string;
  ok: boolean;
  message: string;
  fichiersImportes: string[];
};

type ListerFichiersFn = (
  ip: string
) => Promise<{ ok: true; fichiers: string[] } | { ok: false; error: string }>;

type TelechargerFichierFn = (
  ip: string,
  nomFichier: string
) => Promise<
  | { ok: true; blob: Blob; nomFichier: string }
  | { ok: false; error: string }
>;

/**
 * Telecharge des sons depuis sons/ sur un Pi et les ajoute sur la piste WAM liee.
 */
export default class RaspberryImportAudioService {
  constructor(
    private readonly pont: IWamPistesPont,
    private readonly liaisonPistes: RaspberryPisteLiaisonService,
    private readonly listerFichiers: ListerFichiersFn,
    private readonly telechargerFichier: TelechargerFichierFn
  ) {}

  public listerCibles(raspberries: Raspberry[]): CibleImportAudio[] {
    return [...raspberries]
      .sort((a, b) => a.ip.localeCompare(b.ip, undefined, { numeric: true }))
      .map((raspberry) => {
        const raspberryId = extraireNumeroRaspberryDepuisIp(raspberry.ip);
        const id = raspberryId ?? 0;
        return {
          ip: raspberry.ip,
          raspberryId: id,
          nomAffichage: formaterNomAffichageRaspberry(raspberry.ip, raspberry.info),
          nomPiste: id > 0 ? formaterNomPisteRaspberry(id) : "rasp ?",
          enLigne: raspberry.isOnline,
          pistePresente:
            id > 0 && this.liaisonPistes.pistePresentePourRaspberry(id, raspberry.ip),
        };
      })
      .filter((cible) => cible.raspberryId > 0);
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

  public async importerSons(
    ip: string,
    nomAffichage: string,
    raspberryId: number,
    fichiers: string[]
  ): Promise<ResultatImportAudio> {
    if (fichiers.length === 0) {
      return {
        ip,
        nomAffichage,
        ok: false,
        message: "Cochez au moins un son a importer.",
        fichiersImportes: [],
      };
    }

    const liaison = await this.liaisonPistes.assurerPistePourRaspberry(ip, raspberryId);
    const pisteParNom = this.pont.trouverPisteIdParNumeroRaspberry(raspberryId);
    const trackId = pisteParNom ?? liaison.binding.trackId;
    if (!this.pont.pisteExiste(trackId)) {
      return {
        ip,
        nomAffichage,
        ok: false,
        message: `Piste ${liaison.nomPiste} introuvable dans WAM.`,
        fichiersImportes: [],
      };
    }

    const importes: string[] = [];
    const erreurs: string[] = [];
    let positionFinMs: number | undefined;
    const indexBase = this.pont.listerRegionsAudioPiste(trackId).length;

    for (const nomFichier of fichiers) {
      const telecharge = await this.telechargerFichier(ip, nomFichier);
      if (!telecharge.ok) {
        erreurs.push(`${nomFichier} : ${telecharge.error}`);
        continue;
      }
      try {
        const ajoute = await this.pont.ajouterBlobAudioSurPiste(
          trackId,
          telecharge.blob,
          positionFinMs
        );
        const sonNumber = extraireNumeroSonOscDepuisFichier(telecharge.nomFichier);
        nommerRegionApresEnregistrement(this.pont, {
          trackId,
          regionId: ajoute.regionId,
          raspberryId,
          startMs: ajoute.debutMs,
          durationMs: ajoute.finMs - ajoute.debutMs,
          nomFichier: telecharge.nomFichier,
          sonNumber,
          libelle: lireLibelleSon(ip, telecharge.nomFichier),
          indexOrdre: indexBase + importes.length,
        });
        positionFinMs = ajoute.finMs;
        importes.push(nomFichier);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur decodage audio.";
        erreurs.push(`${nomFichier} : ${message}`);
      }
    }

    if (importes.length > 0) {
      this.pont.focusPiste(trackId);
    }

    const detailErreurs =
      erreurs.length > 0 ? `\n${erreurs.slice(0, 3).join("\n")}` : "";
    const suffixeErreurs = erreurs.length > 3 ? `\n... et ${erreurs.length - 3} autre(s).` : "";

    return {
      ip,
      nomAffichage,
      ok: importes.length > 0,
      message:
        importes.length > 0
          ? `${importes.length} son(s) ajoute(s) sur ${liaison.nomPiste}.${detailErreurs}${suffixeErreurs}`
          : `Aucun son importe.${detailErreurs}${suffixeErreurs}`,
      fichiersImportes: importes,
    };
  }
}
