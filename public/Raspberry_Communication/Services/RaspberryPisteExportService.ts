import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import type { RaspberryTrackBinding } from "../Models/RaspberryTrackBinding";
import type Raspberry from "../Models/Raspberry";
import {
  construireNomFichierDistant,
  type TransfertFormulaire,
} from "../utils/agent-transfert/AgentTransfertHelpers";

export type PlanNomFichierSon = {
  nomFichierDistant: string;
  sonNumber: number;
  libelle?: string;
};

export type OptionsExportPiste = {
  decoupage: boolean;
  plans?: PlanNomFichierSon[];
};

export type FichierExportPrepare = {
  fichier: File;
  formulaire: TransfertFormulaire;
};

export type ExportPistePrepare =
  | { ok: true; fichier: File; formulaire: TransfertFormulaire }
  | { ok: false; erreur: string };

export type ExportPistePrepareLot =
  | { ok: true; fichiers: FichierExportPrepare[] }
  | { ok: false; erreur: string };

/**
 * Exporte une piste WAM liee en fichier(s) WAV pret(s) pour l'agent de transfert.
 */
export default class RaspberryPisteExportService {
  constructor(private readonly pont: IWamPistesPont) {}

  public compterRegionsAudio(trackId: number): number {
    return this.pont.compterRegionsAudioPiste(trackId);
  }

  public async preparerExportPiste(
    raspberry: Raspberry,
    binding: RaspberryTrackBinding
  ): Promise<ExportPistePrepare> {
    const lot = await this.preparerExportPisteAvecOptions(raspberry, binding, {
      decoupage: false,
    });
    if (!lot.ok) {
      return lot;
    }
    const premier = lot.fichiers[0];
    if (!premier) {
      return { ok: false, erreur: "Export impossible (aucun fichier)." };
    }
    return { ok: true, fichier: premier.fichier, formulaire: premier.formulaire };
  }

  public async preparerExportPisteAvecOptions(
    raspberry: Raspberry,
    binding: RaspberryTrackBinding,
    options: OptionsExportPiste
  ): Promise<ExportPistePrepareLot> {
    const blobs = await this.exporterBlobsPiste(binding.trackId, options.decoupage);
    if (!blobs.ok) {
      return blobs;
    }
    if (options.plans && options.plans.length !== blobs.blobs.length) {
      return {
        ok: false,
        erreur: `Nombre de noms (${options.plans.length}) different du nombre de sons (${blobs.blobs.length}).`,
      };
    }
    const fichiers = blobs.blobs.map((blob, index) => {
      const plan = options.plans?.[index];
      return this.construireFichier(raspberry, binding, blob, {
        nomFichierDistant: plan?.nomFichierDistant,
        sonNumber: plan?.sonNumber ?? binding.sonNumber,
        libelle: plan?.libelle,
      });
    });
    return { ok: true, fichiers };
  }

  public async exporterBlobsPiste(
    trackId: number,
    decoupage: boolean
  ): Promise<{ ok: true; blobs: Blob[] } | { ok: false; erreur: string }> {
    if (!this.pont.pisteADuContenu(trackId)) {
      return {
        ok: false,
        erreur: "La piste est vide. Ajoutez au moins un son avant l'envoi.",
      };
    }
    const blobs = decoupage
      ? this.pont.exporterRegionsAudioPiste(trackId)
      : await this.exporterPisteFusionnee(trackId);
    if (blobs.length === 0) {
      return {
        ok: false,
        erreur: decoupage
          ? "Aucun son audio a decouper (ajoutez une region audio sur la piste)."
          : "Export impossible (piste vide ou introuvable).",
      };
    }
    return { ok: true, blobs };
  }

  public assemblerFichiers(
    raspberry: Raspberry,
    binding: RaspberryTrackBinding,
    blobs: Blob[],
    plans: PlanNomFichierSon[]
  ): ExportPistePrepareLot {
    if (plans.length !== blobs.length) {
      return {
        ok: false,
        erreur: `Nombre de noms (${plans.length}) different du nombre de sons (${blobs.length}).`,
      };
    }
    const fichiers = blobs.map((blob, index) =>
      this.construireFichier(raspberry, binding, blob, {
        nomFichierDistant: plans[index]?.nomFichierDistant,
        sonNumber: plans[index]?.sonNumber ?? binding.sonNumber,
        libelle: plans[index]?.libelle,
      })
    );
    return { ok: true, fichiers };
  }

  private async exporterPisteFusionnee(trackId: number): Promise<Blob[]> {
    const blob = await this.pont.exporterPisteVersWave(trackId);
    return blob ? [blob] : [];
  }

  private construireFichier(
    raspberry: Raspberry,
    binding: RaspberryTrackBinding,
    blob: Blob,
    extras: { nomFichierDistant?: string; sonNumber: number; libelle?: string }
  ): FichierExportPrepare {
    const formulaire: TransfertFormulaire = {
      sshHost: raspberry.ip,
      sshPort: 22,
      sshUsername: "pi",
      raspberryId: binding.raspberryId,
      sonNumber: extras.sonNumber,
      nomFichierDistant: extras.nomFichierDistant,
      nomSon: extras.libelle,
    };
    const nomFichier = construireNomFichierDistant(formulaire, "export.wav");
    const fichier = new File([blob], nomFichier, { type: "audio/wav" });
    return { fichier, formulaire };
  }
}
