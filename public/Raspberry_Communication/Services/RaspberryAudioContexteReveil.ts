import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";

let demarre = false;

/**
 * Chrome suspendt l'AudioContext quand on change d'onglet (YouTube, etc.).
 * Au retour, WAM joue visuellement mais n'emet plus de son tant qu'on ne reveille pas le contexte.
 */
export function demarrerReveilAudioContexte(pont: IWamPistesPont): void {
  if (demarre) {
    return;
  }
  demarre = true;
  pont.rebrancherSortieAudio();
  const reveiller = (): void => {
    void pont.reprendreContexteAudioSiBesoin();
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      reveiller();
    }
  });
  window.addEventListener("focus", reveiller);
  document.addEventListener("click", reveiller);
  document.addEventListener("keydown", reveiller);
}
