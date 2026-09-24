import type { RaspberryTrackBinding } from "../Models/RaspberryTrackBinding";
import type { EntreeRegionSonPersiste } from "../Services/RaspberryRegionSonStore";

export type PisteRaspberryCreee = {
  trackId: number;
  nomPiste: string;
  binding: RaspberryTrackBinding;
};

/**
 * Pont minimal entre Raspberry_Communication et l'application WAM Studio.
 * Implemente cote WAM (HostController) pour acceder aux pistes sans dupliquer la logique.
 */
export interface IWamPistesPont {
  creerPistePourRaspberry(
    raspberryIp: string,
    raspberryId: number,
    sonNumber: number
  ): Promise<PisteRaspberryCreee>;

  focusPiste(trackId: number): void;

  lireNomPiste(trackId: number): string | undefined;

  exporterPisteVersWave(trackId: number): Promise<Blob | null>;

  compterRegionsAudioPiste(trackId: number): number;

  exporterRegionsAudioPiste(trackId: number): Blob[];

  pisteADuContenu(trackId: number): boolean;

  pisteExiste(trackId: number): boolean;

  trouverPisteIdParNumeroRaspberry(raspberryId: number): number | undefined;

  listerRegionsPistesRaspberry(): RegionPisteRaspberry[];

  listerRegionsAudioPiste(trackId: number): RegionAudioPiste[];

  listerPositionsLibellesRegions(): PositionLibelleRegion[];

  lirePlayheadMs(): number;

  lirePositionMarqueurPiste(tempsMs: number): PositionMarqueurPiste;

  lireTempsMsDepuisXCanvas(xCanvas: number): number;

  lectureEstActive(): boolean;

  pauserLecture(): void;

  reprendreLecture(): void;

  abonnerPlayhead(onPlayhead: (playheadMs: number) => void): () => void;

  reprendreContexteAudioSiBesoin(): Promise<void>;

  /** Recable host + pistes vers la destination audio (silence Chrome apres YouTube). */
  rebrancherSortieAudio(): void;

  reglerVolumePistes(volume01: number, sonNumber?: number): void;

  reglerMutePistes(mute: boolean, sonNumber?: number): void;

  lireVolumePistes(sonNumber?: number): number;

  lierPisteExistante(
    trackId: number,
    raspberryIp: string,
    raspberryId: number,
    sonNumber: number
  ): PisteRaspberryCreee;

  restaurerNomsPistesLiees(): void;

  lireSignaturePistes(): string;

  exporterSessionLocale(): Promise<SessionProjetLocale | null>;

  importerSessionLocale(session: SessionProjetLocale): Promise<void>;

  /** Ajoute un fichier audio en fin de piste (ou a la position indiquee). */
  ajouterBlobAudioSurPiste(
    trackId: number,
    blob: Blob,
    positionDebutMs?: number
  ): Promise<RegionAjouteePiste>;

  finirChargementEditeur(): void;
}

export type RegionAjouteePiste = {
  regionId: number;
  debutMs: number;
  finMs: number;
};

export type RegionAudioPiste = {
  regionId: number;
  startMs: number;
  durationMs: number;
  endMs: number;
};

export type RegionPisteRaspberry = {
  trackId: number;
  regionId: number;
  raspberryId: number;
  nomPiste: string;
  startMs: number;
  durationMs: number;
  endMs: number;
  sonNumber: number | null;
  nomFichier: string;
  nomAffiche: string;
};

export type PositionLibelleRegion = {
  trackId: number;
  regionId: number;
  nomAffiche: string;
  x: number;
  y: number;
  visible: boolean;
};

export type PositionMarqueurPiste = {
  x: number;
  y: number;
  hauteur: number;
  visible: boolean;
};

export type SessionProjetLocale = {
  project: object;
  contents: { content_name: string; blob: Blob }[];
  regionsSons?: Record<string, EntreeRegionSonPersiste>;
};
