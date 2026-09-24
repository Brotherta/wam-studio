import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import { formaterNomAfficheSon } from "../utils/osc/NomSonPiste";
import { enregistrerRegionSon } from "./RaspberryRegionSonStore";
import { rafraichirLibellesRegionUi } from "./RaspberryLibellesRegionUi";

export type ParametresNomRegion = {
  trackId: number;
  regionId: number;
  raspberryId: number;
  startMs: number;
  durationMs: number;
  nomFichier: string;
  sonNumber: number | null;
  libelle?: string;
  indexOrdre?: number;
};

/** Enregistre le nom du son sur la piste (store + libelle visuel). */
export function nommerRegionApresEnregistrement(
  pont: IWamPistesPont,
  params: ParametresNomRegion
): void {
  const nomAffiche = formaterNomAfficheSon(params.nomFichier, {
    libelle: params.libelle,
    sonNumber: params.sonNumber,
  });

  enregistrerRegionSon({
    trackId: params.trackId,
    regionId: params.regionId,
    raspberryId: params.raspberryId,
    startMs: params.startMs,
    durationMs: params.durationMs,
    sonNumber: params.sonNumber,
    nomFichier: params.nomFichier,
    nomAffiche,
    indexOrdre: params.indexOrdre,
  });

  rafraichirLibellesRegionUi(pont);
}

/** Reapplique les libelles apres restauration F5 ou changement de zoom. */
export function restaurerLibellesRegions(pont: IWamPistesPont): void {
  rafraichirLibellesRegionUi(pont);
}
