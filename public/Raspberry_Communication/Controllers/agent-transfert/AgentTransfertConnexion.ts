type SocketIoClient = {
  id?: string;
  connected: boolean;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
  emit: (event: string, payload?: unknown) => void;
  disconnect: () => void;
};

declare global {
  interface Window {
    io?: (url: string, opts?: Record<string, unknown>) => SocketIoClient;
  }
}

let scriptChargeEnCours: Promise<void> | null = null;

export async function chargerBibliothequeSocketIo(agentBaseUrl: string): Promise<void> {
  if (window.io) return;
  if (scriptChargeEnCours) {
    await scriptChargeEnCours;
    return;
  }
  scriptChargeEnCours = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${agentBaseUrl}/socket.io/socket.io.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossible de charger Socket.IO depuis l'agent de transfert."));
    document.head.appendChild(script);
  });
  await scriptChargeEnCours;
}

export function creerSocketAgent(agentBaseUrl: string): SocketIoClient {
  if (!window.io) {
    throw new Error("Socket.IO non charge. Appelez chargerBibliothequeSocketIo d'abord.");
  }
  return window.io(agentBaseUrl, { reconnection: true });
}

export type { SocketIoClient };
