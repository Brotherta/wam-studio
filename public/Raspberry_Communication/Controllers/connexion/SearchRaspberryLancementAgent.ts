/** Lancement et surveillance de l'agent de transfert (port 3100). */

export type HoteLancementAgent = {
  agentBaseUrl: string;
  afficherStatut: (text: string) => void;
  envoyerMessage: (message: Record<string, unknown> & { type: string }) => boolean;
  mettreAJourEtatAgent: (running: boolean) => void;
};

export async function verifierSanteAgentDepuisNavigateur(agentBaseUrl: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${agentBaseUrl}/health`, { signal: controller.signal });
    if (!response.ok) return false;
    const payload = (await response.json()) as { ok?: boolean };
    return payload.ok === true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function synchroniserEtatAgent(hote: HoteLancementAgent): Promise<boolean> {
  const actif = await verifierSanteAgentDepuisNavigateur(hote.agentBaseUrl);
  hote.mettreAJourEtatAgent(actif);
  return actif;
}

export async function attendreDisponibiliteAgent(
  agentBaseUrl: string,
  delaiMaxMs = 30_000,
  intervalleMs = 500
): Promise<boolean> {
  const debut = Date.now();
  while (Date.now() - debut < delaiMaxMs) {
    if (await verifierSanteAgentDepuisNavigateur(agentBaseUrl)) {
      return true;
    }
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, intervalleMs);
    });
  }
  return false;
}

async function demarrerAgentTransfertViaServeur(
  hote: HoteLancementAgent,
  options: { afficherProgression: boolean; delaiMaxMs: number }
): Promise<boolean> {
  if (await verifierSanteAgentDepuisNavigateur(hote.agentBaseUrl)) {
    hote.mettreAJourEtatAgent(true);
    return true;
  }

  if (options.afficherProgression) {
    hote.afficherStatut("Demarrage de l'agent de transfert (port 3100)...");
  }
  const envoye = hote.envoyerMessage({ type: "startAgentTransfert" });
  if (!envoye) {
    if (options.afficherProgression) {
      hote.afficherStatut(
        "Connexion au serveur Raspberry requise. Lancez le serveur (bouton vert/rouge) puis reessayez."
      );
    }
    return false;
  }

  if (options.afficherProgression) {
    hote.afficherStatut("Demarrage en cours, patientez (jusqu'a 30 s)...");
  }
  const pret = await attendreDisponibiliteAgent(hote.agentBaseUrl, options.delaiMaxMs);
  hote.mettreAJourEtatAgent(pret);
  if (pret && options.afficherProgression) {
    hote.afficherStatut("Agent de transfert actif (port 3100).");
  } else if (!pret && options.afficherProgression) {
    hote.afficherStatut(
      "L'agent n'a pas repondu a temps. Lancez manuellement: npm run dev dans agent-transfert/"
    );
  }
  return pret;
}

/** Demarrage silencieux au chargement du site (WS Raspberry requis). */
export async function assurerAgentTransfertDemarreAutomatiquement(
  hote: HoteLancementAgent
): Promise<boolean> {
  return demarrerAgentTransfertViaServeur(hote, {
    afficherProgression: false,
    delaiMaxMs: 30_000,
  });
}

export async function lancerAgentTransfertDepuisUi(hote: HoteLancementAgent): Promise<boolean> {
  if (await verifierSanteAgentDepuisNavigateur(hote.agentBaseUrl)) {
    hote.mettreAJourEtatAgent(true);
    hote.afficherStatut("Agent de transfert actif (port 3100).");
    return true;
  }
  return demarrerAgentTransfertViaServeur(hote, {
    afficherProgression: true,
    delaiMaxMs: 30_000,
  });
}

export function demanderStatutAgentViaWebSocket(hote: Pick<HoteLancementAgent, "envoyerMessage">): void {
  hote.envoyerMessage({ type: "getAgentTransfertStatus" });
}

export function demarrerSurveillanceAgentTransfert(
  hote: HoteLancementAgent,
  intervalleMs: number,
  lireTimer: () => number | null,
  ecrireTimer: (timer: number | null) => void,
  surveillanceActive: () => boolean
): void {
  if (lireTimer() !== null) return;
  const timer = window.setInterval(() => {
    if (!surveillanceActive()) {
      return;
    }
    void synchroniserEtatAgent(hote);
  }, intervalleMs);
  ecrireTimer(timer);
}

export function arreterSurveillanceAgentTransfert(
  lireTimer: () => number | null,
  ecrireTimer: (timer: number | null) => void
): void {
  const timer = lireTimer();
  if (timer === null) return;
  window.clearInterval(timer);
  ecrireTimer(null);
}
