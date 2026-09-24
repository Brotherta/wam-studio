import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import {
  enregistrerSessionLocale,
  enregistrerSessionLocaleImmediate,
  lireSessionLocale,
  type SessionProjetLocaleStockee,
} from "./RaspberryProjetLocalStore";

const INTERVALLE_DETECTION_MS = 2000;
const DEBOUNCE_SAUVEGARDE_MS = 3000;

/**
 * Sauvegarde automatique des pistes WAM dans IndexedDB pour survivre a un refresh.
 */
export default class RaspberryProjetLocalPersistance {
  private derniereSignature = "";
  private timer: number | null = null;
  private debounceTimer: number | null = null;
  private sauvegardeEnCours = false;
  private restaurationEnCours = false;
  private rechargementEnCours = false;
  private sessionPrete: SessionProjetLocaleStockee | null = null;

  constructor(private readonly pont: IWamPistesPont) {}

  public async restaurerAuDemarrage(): Promise<void> {
    this.restaurationEnCours = true;
    try {
      const session = await lireSessionLocale();
      if (!session || !Array.isArray((session.project as { tracks?: unknown[] }).tracks)) {
        this.derniereSignature = this.pont.lireSignaturePistes();
        return;
      }
      const tracks = (session.project as { tracks: unknown[] }).tracks;
      if (tracks.length === 0) {
        this.derniereSignature = this.pont.lireSignaturePistes();
        return;
      }
      this.sessionPrete = session;
      await this.pont.importerSessionLocale({
        project: session.project,
        contents: session.contents,
        regionsSons: session.regionsSons,
      });
      this.derniereSignature = this.pont.lireSignaturePistes();
    } catch (erreur) {
      console.warn("Restauration locale des pistes impossible.", erreur);
      this.pont.finirChargementEditeur();
    } finally {
      this.restaurationEnCours = false;
      this.pont.finirChargementEditeur();
    }
  }

  public demarrerAutosave(): void {
    if (this.timer !== null) {
      return;
    }
    void lireSessionLocale();
    this.timer = window.setInterval(() => {
      this.planifierSauvegardeSiModifie();
    }, INTERVALLE_DETECTION_MS);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flushSessionConnue();
      }
    });
    window.addEventListener("pagehide", () => this.flushSessionConnue());
    window.addEventListener("beforeunload", () => this.flushSessionConnue());
    window.addEventListener("keydown", (event) => this.intercepterRechargement(event), true);
    this.intercepterRefreshNavigateur();
  }

  private intercepterRefreshNavigateur(): void {
    const navigation = (
      window as Window & {
        navigation?: {
          addEventListener: (
            type: string,
            listener: (event: {
              canIntercept: boolean;
              navigationType: string;
              intercept: (options: { handler: () => Promise<void> }) => void;
            }) => void
          ) => void;
        };
      }
    ).navigation;
    if (!navigation) {
      return;
    }
    navigation.addEventListener("navigate", (event) => {
      if (this.rechargementEnCours) {
        return;
      }
      if (!event.canIntercept || event.navigationType !== "reload") {
        return;
      }
      event.intercept({
        handler: () => this.sauvegarderPuisRecharger(),
      });
    });
  }

  private flushSessionConnue(): void {
    if (this.sessionPrete && compterBlobsAudio(this.sessionPrete.contents) > 0) {
      enregistrerSessionLocaleImmediate(this.sessionPrete);
    }
  }

  private planifierSauvegardeSiModifie(): void {
    if (this.restaurationEnCours) {
      return;
    }
    const signature = this.pont.lireSignaturePistes();
    if (!signature || signature === this.derniereSignature) {
      return;
    }
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = window.setTimeout(() => {
      this.debounceTimer = null;
      void this.sauvegarderSiModifie();
    }, DEBOUNCE_SAUVEGARDE_MS);
  }

  private intercepterRechargement(event: KeyboardEvent): void {
    const estF5 = event.key === "F5";
    const estRaccourciRecharger =
      (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r";
    if (!estF5 && !estRaccourciRecharger) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    void this.sauvegarderPuisRecharger();
  }

  private async sauvegarderPuisRecharger(): Promise<void> {
    if (this.rechargementEnCours) {
      return;
    }
    this.rechargementEnCours = true;
    try {
      await this.attendreFinSauvegarde();
      await this.sauvegarderSiModifie(true);
    } finally {
      window.location.reload();
    }
  }

  /** Sauvegarde immediate des pistes (meme logique que F5, sans recharger). */
  public async sauvegarderMaintenant(): Promise<{ ok: boolean; message: string }> {
    if (this.restaurationEnCours) {
      return { ok: false, message: "Restauration en cours, reessayez dans un instant." };
    }
    await this.attendreFinSauvegarde();
    const ok = await this.sauvegarderSiModifie(true);
    if (ok) {
      return { ok: true, message: "Pistes enregistrees." };
    }
    return { ok: false, message: "Aucune piste a enregistrer." };
  }

  private async attendreFinSauvegarde(): Promise<void> {
    const debut = Date.now();
    while (this.sauvegardeEnCours && Date.now() - debut < 15000) {
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
  }

  private async sauvegarderSiModifie(forcer = false): Promise<boolean> {
    if (this.restaurationEnCours || this.sauvegardeEnCours) {
      return false;
    }
    const signature = this.pont.lireSignaturePistes();
    if (!signature) {
      return false;
    }
    if (!forcer && signature === this.derniereSignature) {
      return false;
    }
    this.sauvegardeEnCours = true;
    try {
      const session = await this.pont.exporterSessionLocale();
      if (!session) {
        return false;
      }
      const existante = this.sessionPrete ?? (await lireSessionLocale());
      const nbNouveau = compterBlobsAudio(session.contents);
      const nbAncien = compterBlobsAudio(existante?.contents);
      if (nbNouveau === 0 && nbAncien > 0) {
        console.warn("Sauvegarde locale ignoree : les pistes actuelles n'ont plus d'audio.");
        return false;
      }
      const stockee: SessionProjetLocaleStockee = {
        ...session,
        enregistreA: Date.now(),
      };
      this.sessionPrete = stockee;
      await enregistrerSessionLocale(stockee);
      this.derniereSignature = signature;
      return true;
    } catch (erreur) {
      console.warn("Sauvegarde locale des pistes impossible.", erreur);
      return false;
    } finally {
      this.sauvegardeEnCours = false;
    }
  }
}

function compterBlobsAudio(
  contents: { blob?: Blob }[] | undefined
): number {
  if (!contents) {
    return 0;
  }
  return contents.filter((contenu) => {
    const blob = contenu.blob;
    return blob instanceof Blob ? blob.size > 0 : Boolean(blob);
  }).length;
}
