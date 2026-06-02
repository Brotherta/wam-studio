/** Lancement du runtime Raspberry via l’API HTTP (`/api/raspberry/*`). */

export type HoteLancementServeur = {
  afficherStatut: (text: string) => void;
  mettreCouleurBoutonLancement: (serveurActif: boolean) => void;
  ouvrirFenetreApresLancement: () => void;
};

export async function lancerServeurRaspberryDepuisMenu(hote: HoteLancementServeur): Promise<void> {
  hote.afficherStatut("Verification du serveur Raspberry...");
  hote.mettreCouleurBoutonLancement(false);
  try {
    const response = await fetch("/api/raspberry/lancement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      hote.afficherStatut("Echec du lancement.");
      hote.mettreCouleurBoutonLancement(false);
      return;
    }
    await synchroniserCouleurBoutonLancement(hote);
    hote.afficherStatut("Serveur Raspberry lance.");
    hote.ouvrirFenetreApresLancement();
  } catch {
    hote.afficherStatut("Impossible de lancer le serveur Raspberry.");
    hote.mettreCouleurBoutonLancement(false);
  }
}

export async function synchroniserCouleurBoutonLancement(
  hote: Pick<HoteLancementServeur, "mettreCouleurBoutonLancement">
): Promise<void> {
  try {
    const response = await fetch("/api/raspberry/status");
    if (!response.ok) {
      hote.mettreCouleurBoutonLancement(false);
      return;
    }
    const payload = await response.json();
    hote.mettreCouleurBoutonLancement(!!payload.running);
  } catch {
    hote.mettreCouleurBoutonLancement(false);
  }
}

export function demarrerSurveillanceEtatServeur(
  hote: Pick<HoteLancementServeur, "mettreCouleurBoutonLancement">,
  intervalleMs: number,
  lireTimer: () => number | null,
  ecrireTimer: (timer: number | null) => void
): void {
  if (lireTimer() !== null) {
    return;
  }
  const timer = window.setInterval(() => {
    synchroniserCouleurBoutonLancement(hote);
  }, intervalleMs);
  ecrireTimer(timer);
}
