import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import type Raspberry from "../Models/Raspberry";
import type { TransfertFormulaire } from "../utils/agent-transfert/AgentTransfertHelpers";
import {
  extraireNumeroRaspberryDepuisIp,
  formaterNomAffichageRaspberry,
  formaterNomPisteRaspberry,
} from "../utils/agent-transfert/AgentTransfertHelpers";
import {
  collecterNumerosOccupes,
  construireNomSonAutomatique,
  reserverProchainNumeroWam,
} from "../utils/osc/AttributionNumerosSons";
import { enregistrerLibelleSon } from "./RaspberryLibellesSonsStore";
import { nommerRegionApresEnregistrement } from "./RaspberryNomRegionService";
import RaspberryPisteLiaisonService from "./RaspberryPisteLiaisonService";
import RaspberryPisteExportService, {
  type PlanNomFichierSon,
} from "./RaspberryPisteExportService";

export type OptionsEnvoiPiste = {
  decoupage: boolean;
  renommage: boolean;
  nomsSons: string[];
};

export type SelectionEnvoiAudio = {
  ip: string;
  options: OptionsEnvoiPiste;
};

export type CibleEnvoiAudio = {
  raspberry: Raspberry;
  nomAffichage: string;
  nomPiste: string;
  pistePresente: boolean;
  nombreRegionsAudio: number;
  sonNumber?: number;
};

export type ResultatEnvoiUnitaire = {
  ip: string;
  nomAffichage: string;
  ok: boolean;
  message: string;
};

export type ProgressionLotEnvoi = {
  ip: string;
  texte: string;
  indexFichier: number;
  totalFichiers: number;
  nomFichier?: string;
  resetProgression: boolean;
};

type EnvoyerFichierFn = (
  fichier: File,
  formulaire: TransfertFormulaire
) => Promise<{ ok: true } | { ok: false; error: string }>;

type ListerFichiersFn = (
  ip: string
) => Promise<{ ok: true; fichiers: string[] } | { ok: false; error: string }>;

const OPTIONS_ENVOI_DEFAUT: OptionsEnvoiPiste = {
  decoupage: false,
  renommage: false,
  nomsSons: [],
};

/**
 * Exporte chaque piste liee (WAV) et l'envoie au Raspberry correspondant.
 */
export default class RaspberryEnvoiAudioLotService {
  constructor(
    private readonly pont: IWamPistesPont,
    private readonly liaison: RaspberryPisteLiaisonService,
    private readonly exportPistes: RaspberryPisteExportService,
    private readonly envoyerFichier: EnvoyerFichierFn,
    private readonly listerFichiers: ListerFichiersFn
  ) {}

  public listerCibles(raspberries: Raspberry[]): CibleEnvoiAudio[] {
    return [...raspberries]
      .sort((a, b) => a.ip.localeCompare(b.ip, undefined, { numeric: true }))
      .map((raspberry) => this.decrireCible(raspberry));
  }

  public decrireCible(raspberry: Raspberry): CibleEnvoiAudio {
    const raspberryId = extraireNumeroRaspberryDepuisIp(raspberry.ip);
    const nomPiste =
      raspberryId !== undefined ? formaterNomPisteRaspberry(raspberryId) : "piste inconnue";
    const binding = this.liaison.lireBindingPourIp(raspberry.ip);
    const pistePresente =
      raspberryId !== undefined &&
      this.liaison.pistePresentePourRaspberry(raspberryId, raspberry.ip);
    const trackId =
      raspberryId !== undefined
        ? this.liaison.lireTrackIdPourEnvoi(raspberry.ip, raspberryId)
        : undefined;
    const nombreRegionsAudio =
      trackId !== undefined ? this.exportPistes.compterRegionsAudio(trackId) : 0;

    return {
      raspberry,
      nomAffichage: formaterNomAffichageRaspberry(raspberry.ip, raspberry.info),
      nomPiste,
      pistePresente,
      nombreRegionsAudio,
      sonNumber: binding?.sonNumber,
    };
  }

  public async envoyerVersPlusieurs(
    raspberries: Raspberry[],
    onProgress?: (info: ProgressionLotEnvoi) => void
  ): Promise<ResultatEnvoiUnitaire[]> {
    const resultats: ResultatEnvoiUnitaire[] = [];
    for (const raspberry of raspberries) {
      const resultat = await this.envoyerVersUn(raspberry, onProgress);
      resultats.push(resultat);
    }
    return resultats;
  }

  public async envoyerVersUn(
    raspberry: Raspberry,
    onProgress?: (info: ProgressionLotEnvoi) => void,
    options: OptionsEnvoiPiste = OPTIONS_ENVOI_DEFAUT
  ): Promise<ResultatEnvoiUnitaire> {
    const nomAffichage = formaterNomAffichageRaspberry(raspberry.ip, raspberry.info);
    const raspberryId = extraireNumeroRaspberryDepuisIp(raspberry.ip);
    if (raspberryId === undefined) {
      return this.echec(raspberry.ip, nomAffichage, "Adresse IP invalide.");
    }
    if (!raspberry.isOnline) {
      return this.echec(raspberry.ip, nomAffichage, "Raspberry hors ligne.");
    }

    const binding = this.liaison.trouverBindingPourEnvoi(raspberry.ip, raspberryId);
    if (!binding) {
      return this.echec(
        raspberry.ip,
        nomAffichage,
        `Aucune piste ${formaterNomPisteRaspberry(raspberryId)} a envoyer.`
      );
    }

    onProgress?.({
      ip: raspberry.ip,
      texte: `Lecture des sons deja presents sur ${nomAffichage}...`,
      indexFichier: 1,
      totalFichiers: 1,
      resetProgression: true,
    });
    const liste = await this.listerFichiers(raspberry.ip);
    if (!liste.ok) {
      return this.echec(
        raspberry.ip,
        nomAffichage,
        `Impossible de lire les sons du Raspberry : ${liste.error}`
      );
    }

    onProgress?.({
      ip: raspberry.ip,
      texte: `Export de ${formaterNomPisteRaspberry(raspberryId)}...`,
      indexFichier: 1,
      totalFichiers: 1,
      resetProgression: true,
    });
    const blobs = await this.exportPistes.exporterBlobsPiste(binding.trackId, options.decoupage);
    if (!blobs.ok) {
      return this.echec(raspberry.ip, nomAffichage, blobs.erreur);
    }
    const occupes = collecterNumerosOccupes(liste.fichiers, {});
    const plans: PlanNomFichierSon[] = blobs.blobs.map((_, index) => {
      const numero = reserverProchainNumeroWam(occupes);
      return {
        nomFichierDistant: construireNomSonAutomatique(numero, ".wav"),
        sonNumber: numero,
        libelle: lireLibelleRenommageOptionnel(options, index),
      };
    });

    const preparation = this.exportPistes.assemblerFichiers(
      raspberry,
      binding,
      blobs.blobs,
      plans
    );
    if (!preparation.ok) {
      return this.echec(raspberry.ip, nomAffichage, preparation.erreur);
    }

    const nomsEnvoyes: string[] = [];
    const regionsPiste = this.pont.listerRegionsAudioPiste(binding.trackId);
    for (let index = 0; index < preparation.fichiers.length; index++) {
      const item = preparation.fichiers[index];
      if (!item) {
        continue;
      }
      const libelle = item.formulaire.nomSon;
      const nomAffiche = libelle ? `${item.fichier.name} (${libelle})` : item.fichier.name;
      onProgress?.({
        ip: raspberry.ip,
        texte: `Envoi ${index + 1}/${preparation.fichiers.length} : ${nomAffiche} (/play ${item.formulaire.sonNumber})`,
        indexFichier: index + 1,
        totalFichiers: preparation.fichiers.length,
        nomFichier: item.fichier.name,
        resetProgression: true,
      });
      const transfert = await this.envoyerFichier(item.fichier, item.formulaire);
      if (!transfert.ok) {
        return this.echec(raspberry.ip, nomAffichage, transfert.error);
      }
      if (libelle) {
        enregistrerLibelleSon(raspberry.ip, item.fichier.name, libelle);
      }
      enregistrerNomRegionApresEnvoi({
        pont: this.pont,
        trackId: binding.trackId,
        raspberryId,
        regionsPiste,
        index,
        decoupage: options.decoupage,
        nomFichier: item.fichier.name,
        sonNumber: item.formulaire.sonNumber ?? null,
        libelle,
      });
      nomsEnvoyes.push(`${nomAffiche} (/play ${item.formulaire.sonNumber ?? "?"})`);
    }

    return {
      ip: raspberry.ip,
      nomAffichage,
      ok: true,
      message: `${formaterNomPisteRaspberry(raspberryId)} envoye (${nomsEnvoyes.join(", ")}).`,
    };
  }

  private echec(ip: string, nomAffichage: string, message: string): ResultatEnvoiUnitaire {
    return { ip, nomAffichage, ok: false, message };
  }
}

/** Nom saisi dans Send Audio, conserve espaces (ex. "test 20"). */
export function lireLibelleRenommageOptionnel(
  options: OptionsEnvoiPiste,
  index: number
): string | undefined {
  if (!options.renommage) {
    return undefined;
  }
  const brut = (options.nomsSons[index] ?? "").trim();
  return brut || undefined;
}

function enregistrerNomRegionApresEnvoi(params: {
  pont: IWamPistesPont;
  trackId: number;
  raspberryId: number;
  regionsPiste: ReturnType<IWamPistesPont["listerRegionsAudioPiste"]>;
  index: number;
  decoupage: boolean;
  nomFichier: string;
  sonNumber: number | null;
  libelle?: string;
}): void {
  const region =
    params.decoupage || params.regionsPiste.length === 1
      ? params.regionsPiste[params.index]
      : undefined;
  if (!region) {
    return;
  }
  nommerRegionApresEnregistrement(params.pont, {
    trackId: params.trackId,
    regionId: region.regionId,
    raspberryId: params.raspberryId,
    startMs: region.startMs,
    durationMs: region.durationMs,
    nomFichier: params.nomFichier,
    sonNumber: params.sonNumber,
    libelle: params.libelle,
    indexOrdre: params.index,
  });
}
