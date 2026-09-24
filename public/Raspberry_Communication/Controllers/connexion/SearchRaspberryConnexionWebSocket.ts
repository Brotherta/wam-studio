/** Connexion WebSocket vers le serveur Raspberry (port 8383). */

export type HoteConnexionWebSocket = {
  searchWindow: HTMLDivElement;
  wsServerIp: string;
  wsServerPort: number;
  reconnectDelayMs: number;
  doitReconnecter: () => boolean;
  lireSocket: () => WebSocket | null;
  ecrireSocket: (socket: WebSocket | null) => void;
  afficherStatut: (text: string) => void;
  lireCheminDossierIni: () => string;
  traiterMessageServeur: (rawData: unknown) => Promise<void>;
  onApresConnexionServeur?: () => void;
};

export function construireUrlWebSocketServeur(wsServerIp: string, wsServerPort: number): string {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${wsServerIp}:${wsServerPort}`;
}

export function envoyerMessageWebSocket(
  hote: Pick<HoteConnexionWebSocket, "lireSocket">,
  message: Record<string, unknown> & { type: string }
): boolean {
  const socket = hote.lireSocket();
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return true;
  }
  return false;
}

export function demarrerConnexionWebSocket(hote: HoteConnexionWebSocket): void {
  const socketActuel = hote.lireSocket();
  if (socketActuel && (socketActuel.readyState === WebSocket.OPEN || socketActuel.readyState === WebSocket.CONNECTING)) {
    return;
  }

  hote.afficherStatut("Connexion au serveur Raspberry...");
  const socket = new WebSocket(construireUrlWebSocketServeur(hote.wsServerIp, hote.wsServerPort));
  hote.ecrireSocket(socket);

  socket.addEventListener("open", () => {
    hote.afficherStatut("Connecte.");
    envoyerMessageWebSocket(hote, { type: "startControleur" });
    envoyerMessageWebSocket(hote, { type: "getRaspConfig" });
    envoyerMessageWebSocket(hote, { type: "requestRaspList" });
    envoyerMessageWebSocket(hote, { type: "getRaspNetworkStatus" });
    envoyerMessageWebSocket(hote, {
      type: "getRaspberryParcState",
      iniPath: hote.lireCheminDossierIni(),
    });
    hote.onApresConnexionServeur?.();
  });

  socket.addEventListener("message", async (event) => {
    await hote.traiterMessageServeur(event.data);
  });

  socket.addEventListener("close", () => {
    hote.ecrireSocket(null);
    hote.afficherStatut("Connexion fermee.");
    if (hote.doitReconnecter()) {
      hote.afficherStatut("Reconnexion...");
      window.setTimeout(() => {
        if (hote.doitReconnecter()) {
          demarrerConnexionWebSocket(hote);
        }
      }, hote.reconnectDelayMs);
    }
  });

  socket.addEventListener("error", () => {
    hote.afficherStatut("Erreur de connexion WS.");
  });
}

export function arreterConnexionWebSocket(hote: Pick<HoteConnexionWebSocket, "lireSocket" | "ecrireSocket">): void {
  const socket = hote.lireSocket();
  if (socket) {
    socket.close();
    hote.ecrireSocket(null);
  }
}
