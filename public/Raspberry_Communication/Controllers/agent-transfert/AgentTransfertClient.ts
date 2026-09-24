import {
  logTransfertErreur,
  logTransfertInfo,
  logTransfertAvertissement,
} from "../../utils/agent-transfert/AgentTransfertLogger";
import {
  construireCommandeStartTransfer,
  construireEntetesUploadNommage,
  MOT_DE_PASSE_SSH_PI,
  type TransfertFormulaire,
  validerFormulaireTransfert,
} from "../../utils/agent-transfert/AgentTransfertHelpers";
import {
  chargerBibliothequeSocketIo,
  creerSocketAgent,
  type SocketIoClient,
} from "./AgentTransfertConnexion";

export type ConfigPersisteeAgent = {
  sshHost?: string;
  sshPort?: number;
  sshLogin?: string;
  privateKeyPath?: string;
};

export type EvenementTransfertUi = {
  transferId: string;
  type: string;
  state?: string;
  phase?: string;
  percent?: number;
  current?: number;
  total?: number;
  speed?: number;
  remainingSeconds?: number;
  message?: string;
};

export type CallbacksTransfertUi = {
  onConnexionChange: (connecte: boolean) => void;
  onEvenement: (event: EvenementTransfertUi) => void;
  onErreur: (message: string) => void;
  onJournal?: (message: string) => void;
};

export default class AgentTransfertClient {
  private socket: SocketIoClient | null = null;
  private transferIdCourant: string | null = null;
  private envoiEnCours = false;
  private erreurSocketDejaTraitee = false;
  private ecouteursDejaBranches = false;
  private attentes: Array<{
    predicat: (event: EvenementTransfertUi) => boolean;
    resolve: (event: EvenementTransfertUi) => void;
    reject: (erreur: Error) => void;
    timer: number;
  }> = [];

  constructor(
    private readonly agentBaseUrl: string,
    private readonly callbacks: CallbacksTransfertUi
  ) {}

  public lireTransferIdCourant(): string | null {
    return this.transferIdCourant;
  }

  public estEnvoiEnCours(): boolean {
    return this.envoiEnCours;
  }

  public async verifierSante(): Promise<{ ok: boolean; configPersistee?: ConfigPersisteeAgent; error?: string }> {
    try {
      logTransfertInfo("Verification sante agent", this.agentBaseUrl);
      const response = await fetch(`${this.agentBaseUrl}/health`);
      if (!response.ok) {
        const erreur = `Agent indisponible (HTTP ${response.status}).`;
        logTransfertErreur(erreur);
        return { ok: false, error: erreur };
      }
      const payload = (await response.json()) as {
        ok?: boolean;
        configPersistee?: ConfigPersisteeAgent;
      };
      const ok = payload.ok === true;
      logTransfertInfo(ok ? "Agent disponible" : "Agent repond mais ok=false", payload);
      return { ok, configPersistee: payload.configPersistee };
    } catch (error) {
      const erreur = `Agent de transfert introuvable sur ${this.agentBaseUrl}. Lancez: npm run dev dans agent-transfert/`;
      logTransfertErreur(erreur, error);
      return { ok: false, error: erreur };
    }
  }

  public async listerFichiersSonSurPi(
    sshHost: string
  ): Promise<
    | { ok: true; fichiers: string[]; remoteDirectory: string }
    | { ok: false; error: string }
  > {
    try {
      const sante = await this.verifierSante();
      if (!sante.ok) {
        return { ok: false, error: sante.error || "Agent de transfert indisponible (port 3100)." };
      }

      const response = await fetch(`${this.agentBaseUrl}/remote/files/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sshHost,
          sshPort: 22,
          sshUsername: "pi",
          sshPassword: MOT_DE_PASSE_SSH_PI,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        fichiers?: string[];
        remoteDirectory?: string;
        error?: string;
      };

      if (!response.ok || payload.ok !== true || !Array.isArray(payload.fichiers)) {
        return {
          ok: false,
          error: payload.error || `Liste fichiers impossible (HTTP ${response.status}).`,
        };
      }

      return {
        ok: true,
        fichiers: payload.fichiers,
        remoteDirectory: payload.remoteDirectory || "",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur reseau.";
      return { ok: false, error: message };
    }
  }

  public async supprimerFichiersSonSurPi(
    sshHost: string,
    fichiers: string[]
  ): Promise<
    | { ok: true; supprimes: string[]; ignores: string[] }
    | { ok: false; error: string }
  > {
    try {
      const sante = await this.verifierSante();
      if (!sante.ok) {
        return { ok: false, error: sante.error || "Agent de transfert indisponible (port 3100)." };
      }

      const response = await fetch(`${this.agentBaseUrl}/remote/files/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sshHost,
          sshPort: 22,
          sshUsername: "pi",
          sshPassword: MOT_DE_PASSE_SSH_PI,
          fichiers,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        supprimes?: string[];
        ignores?: string[];
        error?: string;
      };

      if (!response.ok || payload.ok !== true || !Array.isArray(payload.supprimes)) {
        return {
          ok: false,
          error: payload.error || `Suppression impossible (HTTP ${response.status}).`,
        };
      }

      return {
        ok: true,
        supprimes: payload.supprimes,
        ignores: Array.isArray(payload.ignores) ? payload.ignores : [],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur reseau.";
      return { ok: false, error: message };
    }
  }

  public async telechargerFichierSonSurPi(
    sshHost: string,
    nomFichier: string
  ): Promise<
    | { ok: true; blob: Blob; nomFichier: string }
    | { ok: false; error: string }
  > {
    try {
      const sante = await this.verifierSante();
      if (!sante.ok) {
        return { ok: false, error: sante.error || "Agent de transfert indisponible (port 3100)." };
      }

      const response = await fetch(`${this.agentBaseUrl}/remote/files/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sshHost,
          sshPort: 22,
          sshUsername: "pi",
          sshPassword: MOT_DE_PASSE_SSH_PI,
          fichier: nomFichier,
        }),
      });

      if (!response.ok) {
        let message = `Telechargement impossible (HTTP ${response.status}).`;
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) {
            message = payload.error;
          }
        } catch {
          // reponse non JSON
        }
        return { ok: false, error: message };
      }

      const nom =
        response.headers.get("X-Fichier-Nom")?.trim() || nomFichier;
      const octets = await response.arrayBuffer();
      if (octets.byteLength === 0) {
        return { ok: false, error: "Fichier vide ou telechargement echoue." };
      }
      const typeMime = typeMimeDepuisNomFichier(nom);
      const blob = new Blob([octets], { type: typeMime });
      return { ok: true, blob, nomFichier: nom };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur reseau.";
      return { ok: false, error: message };
    }
  }

  public async connecter(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }
    if (this.socket) {
      await this.attendreSocketConnecte(this.socket);
      return;
    }
    await chargerBibliothequeSocketIo(this.agentBaseUrl);
    const socket = creerSocketAgent(this.agentBaseUrl);
    this.socket = socket;
    this.brancherEcouteursSocket(socket);
    await this.attendreSocketConnecte(socket);
  }

  private brancherEcouteursSocket(socket: SocketIoClient): void {
    if (this.ecouteursDejaBranches) {
      return;
    }
    this.ecouteursDejaBranches = true;
    socket.on("connect", () => {
      this.callbacks.onConnexionChange(true);
      this.journal(`Socket.IO connecte (${socket.id || "?"})`);
      this.sAbonner();
    });
    socket.on("disconnect", () => {
      this.callbacks.onConnexionChange(false);
      this.journal("Socket.IO deconnecte — reconnexion automatique...");
    });
    socket.on("transfer:event", (raw) => this.relayEvenement(raw));
    socket.on("transfer:snapshot", (raw) => this.relaySnapshot(raw));
    socket.on("agent:event", (raw) => {
      const event = raw as { type?: string; message?: string };
      if (event.type === "log" && event.message) this.journal(event.message);
      if (event.type === "error" && event.message) this.callbacks.onErreur(event.message);
    });
    socket.on("command:ack", (raw) => {
      const ack = raw as { ok?: boolean; error?: string };
      logTransfertInfo("ACK commande agent", ack);
      if (!ack.ok && ack.error) this.callbacks.onErreur(ack.error);
    });
  }

  private attendreSocketConnecte(socket: SocketIoClient, timeoutMs = 15000): Promise<void> {
    if (socket.connected) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        socket.off("connect", onConnect);
        reject(new Error("Connexion Socket.IO a l'agent trop longue (port 3100)."));
      }, timeoutMs);
      const onConnect = () => {
        window.clearTimeout(timer);
        socket.off("connect", onConnect);
        resolve();
      };
      socket.on("connect", onConnect);
    });
  }

  public deconnecter(): void {
    this.viderAttentes();
    this.socket?.disconnect();
    this.socket = null;
    this.ecouteursDejaBranches = false;
    this.callbacks.onConnexionChange(false);
  }

  public async envoyerFichierComplet(
    fichier: File,
    formulaire: TransfertFormulaire
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const validation = validerFormulaireTransfert(formulaire, fichier);
    if (!validation.ok) {
      this.callbacks.onErreur(validation.error);
      return { ok: false, error: validation.error };
    }
    await this.connecter();
    if (!this.socket) {
      const erreur = "Connexion Socket.IO impossible.";
      this.callbacks.onErreur(erreur);
      return { ok: false, error: erreur };
    }

    if (this.envoiEnCours) {
      const erreur = "Un transfert est deja en cours.";
      logTransfertAvertissement("Transfert deja en cours, ignore.");
      return { ok: false, error: erreur };
    }

    this.envoiEnCours = true;
    this.erreurSocketDejaTraitee = false;
    this.transferIdCourant = crypto.randomUUID();
    const transferId = this.transferIdCourant;
    this.journal("Demarrage du flux complet (upload + SCP).");
    this.sAbonner();

    try {
      this.presenterEvenement({ transferId, type: "state", state: "RECEIVING" });
      this.journal("Upload HTTP en cours...");
      await this.uploadFichier(fichier, transferId, formulaire);
      this.presenterEvenement({
        transferId,
        type: "state",
        state: "READY",
      });

      const commande = construireCommandeStartTransfer(formulaire, transferId);
      logTransfertInfo("Envoi startTransfer", commande);
      const finPromise = this.attendreEvenement(
        (event) =>
          (event.type === "state" &&
            (event.state === "COMPLETED" || event.state === "FAILED" || event.state === "CANCELLED")) ||
          event.type === "completed" ||
          event.type === "error",
        600000
      );
      this.socket.emit("command", commande);
      this.journal("Commande startTransfer envoyee — connexion SSH au Raspberry...");
      this.presenterEvenement({ transferId, type: "state", state: "SENDING" });

      const fin = await finPromise;

      if (fin.type === "completed" || fin.state === "COMPLETED") {
        this.journal("Transfert SCP termine avec succes.");
        return { ok: true };
      }
      if (fin.type === "error") {
        throw new Error(fin.message || "Erreur SCP.");
      }
      if (fin.state === "CANCELLED") {
        throw new Error("Transfert annule.");
      }
      throw new Error("Transfert echoue.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue.";
      logTransfertErreur("Echec flux transfert", error);
      if (!this.erreurSocketDejaTraitee) {
        this.callbacks.onEvenement({
          transferId: this.transferIdCourant || "",
          type: "error",
          state: "FAILED",
          message,
        });
        this.callbacks.onErreur(message);
      }
      this.journal(`Erreur: ${message}`);
      return { ok: false, error: message };
    } finally {
      this.envoiEnCours = false;
      this.transferIdCourant = null;
      logTransfertInfo("Flux transfert libere (pret pour un nouvel envoi)");
    }
  }

  public annulerTransfertCourant(): void {
    if (!this.transferIdCourant || !this.socket) return;
    this.socket.emit("command", { type: "cancelTransfer", transferId: this.transferIdCourant });
    this.journal("Annulation demandee.");
  }

  private journal(message: string): void {
    logTransfertInfo(message);
    this.callbacks.onJournal?.(message);
  }

  private sAbonner(): void {
    if (!this.socket || !this.transferIdCourant) return;
    this.socket.emit("subscribe", { transferId: this.transferIdCourant });
  }

  private async uploadFichier(
    fichier: File,
    transferId: string,
    formulaire: TransfertFormulaire
  ): Promise<void> {
    const form = new FormData();
    form.append("file", fichier);
    const entetes = construireEntetesUploadNommage(formulaire, transferId);
    logTransfertInfo("Upload HTTP", { transferId, entetes, fichier: fichier.name });
    const response = await fetch(`${this.agentBaseUrl}/upload`, {
      method: "POST",
      headers: entetes,
      body: form,
    });
    let payload: {
      error?: string;
      filename?: string;
      storedFilename?: string;
      size?: number;
    } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch (error) {
      logTransfertErreur("Reponse upload non JSON", { status: response.status, error });
      throw new Error(`Upload HTTP: reponse invalide (HTTP ${response.status}).`);
    }
    if (!response.ok) {
      logTransfertErreur("Upload HTTP refuse", payload);
      throw new Error(payload.error || `Upload HTTP echoue (HTTP ${response.status}).`);
    }
    const nomStocke = payload.storedFilename || payload.filename || fichier.name;
    this.journal(`Upload recu: ${nomStocke} (${payload.size ?? fichier.size} octets).`);
  }

  private relayEvenement(raw: unknown): void {
    const event = raw as EvenementTransfertUi;
    if (this.transferIdCourant && event.transferId !== this.transferIdCourant) return;
    if (event.type === "error") {
      this.erreurSocketDejaTraitee = true;
    }
    if (event.type !== "progress") {
      logTransfertInfo("Evenement Socket.IO", event);
    }
    this.presenterEvenement(event);
  }

  private relaySnapshot(raw: unknown): void {
    const snapshot = raw as {
      transferId?: string;
      state?: string;
      derniereProgression?: {
        phase?: string;
        current?: number;
        total?: number;
        percent?: number;
      };
    };
    if (this.transferIdCourant && snapshot.transferId !== this.transferIdCourant) return;
    if (snapshot.state) {
      this.presenterEvenement({
        transferId: snapshot.transferId || this.transferIdCourant || "",
        type: "state",
        state: snapshot.state,
      });
    }
    if (snapshot.derniereProgression) {
      this.presenterEvenement({
        transferId: snapshot.transferId || this.transferIdCourant || "",
        type: "progress",
        phase: snapshot.derniereProgression.phase,
        current: snapshot.derniereProgression.current,
        total: snapshot.derniereProgression.total,
        percent: snapshot.derniereProgression.percent,
      });
    }
  }

  private presenterEvenement(event: EvenementTransfertUi): void {
    this.callbacks.onEvenement(event);
    const restantes: typeof this.attentes = [];
    for (const attente of this.attentes) {
      if (this.transferIdCourant && event.transferId && event.transferId !== this.transferIdCourant) {
        restantes.push(attente);
        continue;
      }
      if (!attente.predicat(event)) {
        restantes.push(attente);
        continue;
      }
      window.clearTimeout(attente.timer);
      attente.resolve(event);
    }
    this.attentes = restantes;
  }

  private viderAttentes(erreur?: Error): void {
    const enCours = this.attentes.splice(0);
    for (const attente of enCours) {
      window.clearTimeout(attente.timer);
      attente.reject(erreur ?? new Error("Transfert interrompu."));
    }
  }

  private attendreEvenement(
    predicat: (event: EvenementTransfertUi) => boolean,
    timeoutMs: number
  ): Promise<EvenementTransfertUi> {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.attentes = this.attentes.filter((item) => item.timer !== timer);
        const message = "Delai depasse en attente du transfert.";
        logTransfertErreur(message);
        reject(new Error(message));
      }, timeoutMs);
      this.attentes.push({ predicat, resolve, reject, timer });
    });
  }
}

function typeMimeDepuisNomFichier(nomFichier: string): string {
  const extension = nomFichier.split(".").pop()?.toLowerCase() ?? "";
  if (extension === "mp3") return "audio/mpeg";
  if (extension === "ogg") return "audio/ogg";
  if (extension === "flac") return "audio/flac";
  if (extension === "aiff" || extension === "aif") return "audio/aiff";
  return "audio/wav";
}
