import SearchRaspberryState from "../Models/SearchRaspberryState";
import SearchRaspberryView from "../Views/SearchRaspberryView";
import { traiterMessageBrutServeur } from "./messages/SearchRaspberryParseurMessagesServeur";
import { SearchRaspberryHoteApplicateurMessages } from "./messages/SearchRaspberryHoteApplicateurMessages";
import AgentTransfertClient from "./agent-transfert/AgentTransfertClient";
import {
  extraireNumeroRaspberryDepuisIp,
  formaterNomAffichageRaspberry,
  formaterTexteErreurTransfert,
  type TransfertDraft,
  type TransfertFormulaire,
} from "../utils/agent-transfert/AgentTransfertHelpers";
import {
  mettreAJourStatutTransfertPanneau,
  texteProgressionTransfert,
  appliquerEtatAgentDansDom,
  appliquerStatutTransfertDansDom,
  HotePanneauTransfert,
} from "../Views/panneaux/SearchRaspberryPanneauTransfert";
import Raspberry from "../Models/Raspberry";
import {
  logTransfertErreur,
  logTransfertInfo,
} from "../utils/agent-transfert/AgentTransfertLogger";
import {
  brancherLectureRaspberryEnLigne,
  rafraichirDisponibiliteCasesLiaison,
} from "../Services/RaspberryIndicateurPisteUi";
import {
  HotePanneauListe,
  rafraichirDetailsSiSelection,
  rafraichirListeRaspberry,
} from "../Views/panneaux/SearchRaspberryPanneauListe";
import {
  afficherPanneauListe,
  HoteNavigation,
  masquerPanneauListe,
} from "../Views/panneaux/SearchRaspberryNavigation";
import {
  arreterConnexionWebSocket,
  demarrerConnexionWebSocket,
  envoyerMessageWebSocket,
  HoteConnexionWebSocket,
} from "./connexion/SearchRaspberryConnexionWebSocket";
import {
  HoteLancementServeur,
  lancerServeurRaspberryDepuisMenu,
  synchroniserCouleurBoutonLancement,
} from "./connexion/SearchRaspberryLancementServeur";
import {
  arreterSurveillanceAgentTransfert as arreterTimerSurveillanceAgent,
  assurerAgentTransfertDemarreAutomatiquement,
  demarrerSurveillanceAgentTransfert as demarrerTimerSurveillanceAgent,
  HoteLancementAgent,
  lancerAgentTransfertDepuisUi,
  synchroniserEtatAgent,
} from "./connexion/SearchRaspberryLancementAgent";
import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import RaspberryPisteLiaisonService from "../Services/RaspberryPisteLiaisonService";
import RaspberryPisteAutoCreationService from "../Services/RaspberryPisteAutoCreationService";
import RaspberryPisteExportService from "../Services/RaspberryPisteExportService";
import RaspberryEnvoiAudioLotService, {
  type ProgressionLotEnvoi,
  type ResultatEnvoiUnitaire,
  type SelectionEnvoiAudio,
} from "../Services/RaspberryEnvoiAudioLotService";
import RaspberrySuppressionAudioService from "../Services/RaspberrySuppressionAudioService";
import RaspberryImportAudioService from "../Services/RaspberryImportAudioService";
import RaspberrySequenceurOscService from "../Services/RaspberrySequenceurOscService";
import { retirerLibellesSons } from "../Services/RaspberryLibellesSonsStore";
import RaspberryProjetLocalPersistance from "../Services/RaspberryProjetLocalPersistance";
import { enregistrerSynchronisationPistesRaspberry } from "../Services/RaspberryPisteSynchronisation";
import { restaurerLibellesRegions, nommerRegionApresEnregistrement } from "../Services/RaspberryNomRegionService";
import { demarrerAffichageMarqueursPiste } from "../Services/RaspberryMarqueursPisteUi";
import { demarrerCueLecturePistes } from "../Services/RaspberryMarqueursCueLecture";
import { demarrerOscLecturePistes } from "../Services/RaspberryMarqueursOscLecture";
import { appliquerEffetOscSurPistes } from "../Services/RaspberryMarqueursOscPisteEffet";
import { demarrerReveilAudioContexte } from "../Services/RaspberryAudioContexteReveil";
import type { RaspberryTrackBinding } from "../Models/RaspberryTrackBinding";
import { demarrerSurveillanceNomApresDepotFichier } from "../Services/RaspberryNomPisteProtection";
import { brancherBoutonsAudio } from "../Views/SearchRaspberryBoutonSendAudio";
import { brancherBoutonSavePistes, afficherRetourBoutonSave } from "../Views/SearchRaspberryBoutonSave";
import { brancherBoutonSequenceurOsc } from "../Views/SearchRaspberryBoutonSequenceur";
import { brancherBoutonMarqueurPiste } from "../Views/SearchRaspberryBoutonMarqueur";
import { basculerPlacementMarqueursPiste, brancherEditionMarqueursPiste } from "../Services/RaspberryMarqueursPlacementPiste";
import {
  ouvrirFenetreEnvoiAudio,
  type ControleFenetreEnvoiAudio,
} from "../Views/SearchRaspberryFenetreEnvoiAudio";
import { ouvrirFenetreSuppressionAudio } from "../Views/SearchRaspberryFenetreSuppressionAudio";
import { ouvrirFenetreImportAudio } from "../Views/SearchRaspberryFenetreImportAudio";
import { ouvrirFenetreSequenceurOsc } from "../Views/SearchRaspberryFenetreSequenceurOsc";
import { listerRaspberriesEnLigne } from "../Services/RaspberrySequenceurOscService";
import { invaliderCacheFichiersSonPi } from "../Views/panneaux/SearchRaspberryPanneauOscPlay";

/**
 * Contrôleur de la fenêtre Search Raspberry : logique, WebSocket, timers.
 */
export default class SearchRaspberryController {
  private socket: WebSocket | null = null;
  private listRefreshTimer: number | null = null;
  private launchStatusTimer: number | null = null;
  private agentStatusTimer: number | null = null;
  private readonly agentTransfert: AgentTransfertClient;
  private ipTransfertCourant: string | null = null;
  private liaisonPistes: RaspberryPisteLiaisonService | null = null;
  private pontPistes: IWamPistesPont | null = null;
  private autoCreationPistes: RaspberryPisteAutoCreationService | null = null;
  private exportPistes: RaspberryPisteExportService | null = null;
  private envoiAudioLot: RaspberryEnvoiAudioLotService | null = null;
  private readonly suppressionAudio: RaspberrySuppressionAudioService;
  private importAudio: RaspberryImportAudioService | null = null;
  private sequenceurOsc: RaspberrySequenceurOscService | null = null;
  private persistancePistes: RaspberryProjetLocalPersistance | null = null;
  private promesseRestauration: Promise<void> = Promise.resolve();
  private callbackProgressionEnvoi: ControleFenetreEnvoiAudio | null = null;
  private envoiLotIndex = 0;
  private envoiLotTotal = 0;
  private envoiLotNom = "";
  private envoiLotFichierIndex = 1;
  private envoiLotFichierTotal = 1;
  private envoiLotFichierNom = "";
  private surveillanceAutoPistesActive = false;
  private surveillanceAgentTransfertActive = false;
  private synchronisationPistesEnCours = false;
  private dernierEtatAgentConnu: boolean | null = null;
  private timersSyncPistesDemarrage: number[] = [];
  private serveurRaspberryActifConnu = false;
  private demarrageAutoAgentEnCours = false;
  private demarrageAutoAgentAbandonne = false;

  constructor(
    private readonly view: SearchRaspberryView,
    private readonly state: SearchRaspberryState
  ) {
    this.agentTransfert = new AgentTransfertClient(state.agentTransfertBaseUrl, {
      onConnexionChange: (connecte) => this.mettreAJourConnexionAgent(connecte),
      onEvenement: (event) => this.traiterEvenementTransfert(event),
      onErreur: (message) => this.signalerErreurTransfert(message),
      onJournal: (message) => logTransfertInfo(message),
    });
    this.suppressionAudio = new RaspberrySuppressionAudioService(
      async (ip) => {
        const liste = await this.agentTransfert.listerFichiersSonSurPi(ip);
        if (!liste.ok) {
          return liste;
        }
        return { ok: true, fichiers: liste.fichiers };
      },
      (ip, fichiers) => this.agentTransfert.supprimerFichiersSonSurPi(ip, fichiers)
    );
  }

  public initialiser(): void {
    this.view.monterInterfaceListe(this.obtenirHoteNavigation());
    const ouvrirBoutons = () =>
      brancherBoutonsAudio({
        onSendAudio: () => this.ouvrirFenetreEnvoiAudio(),
        onImportAudio: () => this.ouvrirFenetreImportAudio(),
        onDeleteAudio: () => this.ouvrirFenetreSuppressionAudio(),
      });
    ouvrirBoutons();
    window.setTimeout(ouvrirBoutons, 500);
    const brancherSave = () =>
      brancherBoutonSavePistes(() => {
        void this.sauvegarderPistesManuellement();
      });
    brancherSave();
    window.setTimeout(brancherSave, 500);
    const brancherSequenceur = () =>
      brancherBoutonSequenceurOsc(() => this.ouvrirFenetreSequenceurOsc());
    brancherSequenceur();
    window.setTimeout(brancherSequenceur, 600);
    const brancherMarqueur = () =>
      brancherBoutonMarqueurPiste(() => this.basculerOutilMarqueurPiste());
    brancherMarqueur();
    window.setTimeout(brancherMarqueur, 700);
    void this.verifierServeurRaspberryEtSynchroniserPistes();
    this.demarrerSurveillanceServeurEtPistes();
  }

  private demarrerSurveillanceServeurEtPistes(): void {
    if (this.launchStatusTimer !== null) {
      return;
    }
    this.launchStatusTimer = window.setInterval(() => {
      void this.verifierServeurRaspberryEtSynchroniserPistes();
    }, 2000);
  }

  private async verifierServeurRaspberryEtSynchroniserPistes(): Promise<void> {
    try {
      const response = await fetch("/api/raspberry/status");
      if (!response.ok) {
        this.serveurRaspberryActifConnu = false;
        synchroniserCouleurBoutonLancement(this.obtenirHoteLancement());
        return;
      }
      const payload = (await response.json()) as { running?: boolean };
      const running = payload.running === true;
      const etaitActif = this.serveurRaspberryActifConnu;
      this.serveurRaspberryActifConnu = running;
      synchroniserCouleurBoutonLancement(this.obtenirHoteLancement());
      if (!running || !this.surveillanceAutoPistesActive) {
        return;
      }
      this.demarrerConnexion();
      this.tenterDemarrageAutomatiqueAgent();
      if (!etaitActif) {
        this.planifierSynchronisationsPistesDemarrage();
      }
      await this.synchroniserPistesPourRaspberryEnLigne();
    } catch {
      this.serveurRaspberryActifConnu = false;
      synchroniserCouleurBoutonLancement(this.obtenirHoteLancement());
    }
  }

  public brancherPontPistes(pont: IWamPistesPont): void {
    this.pontPistes = pont;
    brancherLectureRaspberryEnLigne((raspberryId) => {
      for (const raspberry of this.state.raspberryMap.values()) {
        if (extraireNumeroRaspberryDepuisIp(raspberry.ip) === raspberryId) {
          return { ip: raspberry.ip, enLigne: raspberry.isOnline };
        }
      }
      return null;
    });
    this.liaisonPistes = new RaspberryPisteLiaisonService(pont);
    this.autoCreationPistes = new RaspberryPisteAutoCreationService(this.liaisonPistes);
    this.exportPistes = new RaspberryPisteExportService(pont);
    this.envoiAudioLot = new RaspberryEnvoiAudioLotService(
      pont,
      this.liaisonPistes,
      this.exportPistes,
      (fichier, formulaire) => this.agentTransfert.envoyerFichierComplet(fichier, formulaire),
      (ip) => this.agentTransfert.listerFichiersSonSurPi(ip)
    );
    this.importAudio = new RaspberryImportAudioService(
      pont,
      this.liaisonPistes,
      (ip) => this.agentTransfert.listerFichiersSonSurPi(ip),
      (ip, nomFichier) => this.agentTransfert.telechargerFichierSonSurPi(ip, nomFichier)
    );
    this.sequenceurOsc = new RaspberrySequenceurOscService(pont);
    this.persistancePistes = new RaspberryProjetLocalPersistance(pont);
    this.promesseRestauration = new Promise((resolve) => {
      window.setTimeout(() => {
        void this.persistancePistes
          ?.restaurerAuDemarrage()
          .catch(() => undefined)
          .then(() => {
            pont.finirChargementEditeur();
            pont.restaurerNomsPistesLiees();
            restaurerLibellesRegions(pont);
            demarrerAffichageMarqueursPiste(pont);
            brancherEditionMarqueursPiste(pont);
            demarrerCueLecturePistes(pont);
            demarrerOscLecturePistes(pont);
            demarrerReveilAudioContexte(pont);
            this.persistancePistes?.demarrerAutosave();
            enregistrerSynchronisationPistesRaspberry(() => {
              void this.synchroniserPistesPourRaspberryEnLigne();
            });
            resolve();
          });
      }, 1500);
    });
    demarrerSurveillanceNomApresDepotFichier(() => pont.restaurerNomsPistesLiees());
  }

  public async synchroniserPistesPourRaspberryEnLigne(): Promise<void> {
    if (!this.autoCreationPistes || this.synchronisationPistesEnCours) {
      return;
    }
    this.synchronisationPistesEnCours = true;
    try {
      this.state.refreshOnlineStateFromHeartbeat();
      await this.autoCreationPistes.traiterCarteRaspberry(
        this.state.raspberryMap,
        this.state.lireIpsPourSynchronisationPistes()
      );
      if (this.view.estFenetreVisible()) {
        this.rafraichirListe();
      }
    } finally {
      this.synchronisationPistesEnCours = false;
    }
  }

  /** Surveille les Raspberry en arriere-plan et cree les pistes automatiquement. */
  public activerSurveillanceAutoPistes(): void {
    void this.promesseRestauration.then(() => {
      if (!this.liaisonPistes || !this.autoCreationPistes) {
        return;
      }
      this.surveillanceAutoPistesActive = true;
      this.demarrerConnexion();
      this.demarrerBoucleRafraichissementListe();
      this.planifierSynchronisationsPistesDemarrage();
      void this.verifierServeurRaspberryEtSynchroniserPistes();
      this.tenterDemarrageAutomatiqueAgent();
    });
  }

  private planifierSynchronisationsPistesDemarrage(): void {
    this.timersSyncPistesDemarrage.forEach((timer) => window.clearTimeout(timer));
    this.timersSyncPistesDemarrage = [];
    [800, 2000, 5000, 10000].forEach((delai) => {
      const timer = window.setTimeout(() => {
        void this.synchroniserPistesPourRaspberryEnLigne();
      }, delai);
      this.timersSyncPistesDemarrage.push(timer);
    });
  }

  public ouvrirFenetre(): void {
    this.view.afficherFenetre();
    afficherPanneauListe(this.obtenirHoteNavigation());
    this.state.refreshOnlineStateFromHeartbeat();
    this.rafraichirListe();
    this.demarrerBoucleRafraichissementListe();
    this.demarrerConnexion();
    void this.synchroniserPistesPourRaspberryEnLigne();
  }

  public async lancerRuntime(): Promise<void> {
    await lancerServeurRaspberryDepuisMenu(this.obtenirHoteLancement());
  }

  public async sauvegarderPistesManuellement(): Promise<void> {
    if (!this.persistancePistes) {
      this.view.definirStatut("Sauvegarde indisponible pour le moment.");
      afficherRetourBoutonSave(false);
      return;
    }
    this.view.definirStatut("Enregistrement des pistes...");
    const resultat = await this.persistancePistes.sauvegarderMaintenant();
    this.view.definirStatut(resultat.message);
    afficherRetourBoutonSave(resultat.ok);
  }

  public basculerOutilMarqueurPiste(): void {
    if (!this.pontPistes) {
      window.alert("Liaison pistes WAM non disponible.");
      return;
    }
    basculerPlacementMarqueursPiste(this.pontPistes);
  }

  public ouvrirFenetreSequenceurOsc(): void {
    if (!this.sequenceurOsc) {
      window.alert("Liaison pistes WAM non disponible.");
      return;
    }
    this.demarrerConnexion();
    const sequenceur = this.sequenceurOsc;
    const envoyerCommandeOsc = (
      ip: string,
      raspberryId: number,
      message: string,
      value: string
    ): { ok: boolean; detail: string } => {
      const envoye = this.envoyerMessage({
        type: "sendOSCmessage",
        raspIP: ip,
        OSCMessage: message,
        OSCValue: value,
        OSCPort: 4000,
      });
      if (!envoye) {
        return {
          ok: false,
          detail: `WebSocket non connecte (serveur Raspberry) — rasp ${raspberryId}`,
        };
      }
      return { ok: true, detail: "" };
    };
    ouvrirFenetreSequenceurOsc({
      copier: () => sequenceur.copierDepuisPistes(Array.from(this.state.raspberryMap.values())),
      formaterLigne: (evenement) => sequenceur.formaterLigneEvenement(evenement),
      listerRaspberriesConnectes: () =>
        listerRaspberriesEnLigne(Array.from(this.state.raspberryMap.values())),
      envoyerComposition: (ip, raspberryId) =>
        envoyerCommandeOsc(ip, raspberryId, "/composition", "1"),
      envoyerStop: (ip, raspberryId) => envoyerCommandeOsc(ip, raspberryId, "/stop", "-1"),
      envoyerOscPersonnalise: (ip, raspberryId, adresse, valeur) =>
        envoyerCommandeOsc(ip, raspberryId, adresse, valeur),
      appliquerEffetPiste: (adresse, valeur) => {
        if (this.pontPistes) {
          appliquerEffetOscSurPistes(this.pontPistes, adresse, valeur);
        }
      },
      envoyerOsc: (evenement) => {
        if (!evenement.commandeOsc || evenement.sonNumber === null) {
          return { ok: false, detail: "son inconnu" };
        }
        if (!evenement.ip) {
          return { ok: false, detail: "IP Raspberry introuvable" };
        }
        return envoyerCommandeOsc(
          evenement.ip,
          evenement.raspberryId,
          "/play",
          `${evenement.sonNumber} ${evenement.niveau}`
        );
      },
    });
  }

  public fermerFenetre(): void {
    this.view.masquerFenetre();
    masquerPanneauListe(this.obtenirHoteNavigation());
    this.state.resetSelection();
    if (!this.surveillanceAutoPistesActive) {
      this.arreterBoucleRafraichissementListe();
      this.arreterConnexion();
    }
    this.agentTransfert.deconnecter();
    this.ipTransfertCourant = null;
    this.view.fenetreTransfert.masquer();
    this.desactiverSurveillanceAgentTransfert();
  }

  public lierBoutonFermer(): void {
    this.view.lierBoutonFermer(() => this.fermerFenetre());
  }

  private demarrerConnexion(): void {
    demarrerConnexionWebSocket(this.obtenirHoteConnexion());
  }

  private arreterConnexion(): void {
    arreterConnexionWebSocket(this.obtenirHoteConnexion());
  }

  private envoyerMessage(message: Record<string, unknown> & { type: string }): boolean {
    return envoyerMessageWebSocket(this.obtenirHoteConnexion(), message);
  }

  private obtenirHoteConnexion(): HoteConnexionWebSocket {
    const controleur = this;
    return {
      searchWindow: controleur.view.searchWindow,
      wsServerIp: controleur.state.wsServerIp,
      wsServerPort: controleur.state.wsServerPort,
      reconnectDelayMs: controleur.state.reconnectDelayMs,
      doitReconnecter: () =>
        !controleur.view.searchWindow.hidden || controleur.surveillanceAutoPistesActive,
      lireSocket: () => controleur.socket,
      ecrireSocket: (socket) => {
        controleur.socket = socket;
      },
      afficherStatut: (text) => controleur.view.definirStatut(text),
      traiterMessageServeur: (raw) => controleur.traiterMessageServeur(raw),
      onApresConnexionServeur: () => {
        controleur.demarrageAutoAgentAbandonne = false;
        controleur.tenterDemarrageAutomatiqueAgent();
        window.setTimeout(() => {
          void controleur.synchroniserPistesPourRaspberryEnLigne();
        }, 600);
      },
    };
  }

  private obtenirHoteLancement(): HoteLancementServeur {
    const controleur = this;
    return {
      afficherStatut: (text) => controleur.view.definirStatut(text),
      mettreCouleurBoutonLancement: (actif) => controleur.view.mettreCouleurBoutonLancement(actif),
      ouvrirFenetreApresLancement: () => controleur.ouvrirFenetre(),
    };
  }

  private obtenirHoteListe(): HotePanneauListe {
    const controleur = this;
    const etat = controleur.state;
    return {
      raspberryMap: etat.raspberryMap,
      raspberryList: controleur.view.raspberryList,
      detailsBox: controleur.view.detailsBox,
      get selectedRaspberryIp() {
        return etat.selectedRaspberryIp;
      },
      set selectedRaspberryIp(value: string | null) {
        etat.selectedRaspberryIp = value;
      },
      get detailsVisible() {
        return etat.detailsVisible;
      },
      set detailsVisible(value: boolean) {
        etat.detailsVisible = value;
      },
      oscDraftByIp: etat.oscDraftByIp,
      oscLastStatusByIp: etat.oscLastStatusByIp,
      activeExpectedIps: etat.activeExpectedIps,
      sendMessage: (message) => controleur.envoyerMessage(message),
      ouvrirFenetreTransfert: (raspberry) => controleur.ouvrirFenetreTransfert(raspberry),
      lireBindingPourIp: (ip) => controleur.liaisonPistes?.lireBindingPourIp(ip),
      creerOuAllerVersPiste: (raspberry) => {
        void controleur.creerOuAllerVersPiste(raspberry);
      },
      envoyerPisteVersRaspberry: (raspberry) => {
        void controleur.envoyerPisteVersRaspberry(raspberry);
      },
      lireStatutEnvoiPiste: (ip) => controleur.lireStatutEnvoiPiste(ip),
      listerFichiersSonSurPi: (ip) =>
        controleur.listerFichiersSonSurPi(ip),
      afficherPanneauListe: () => afficherPanneauListe(controleur.obtenirHoteNavigation()),
      mettreAJourListe: () => controleur.rafraichirListe(),
    };
  }

  private obtenirHoteTransfert(): HotePanneauTransfert {
    const controleur = this;
    const etat = controleur.state;
    return {
      agentBaseUrl: etat.agentTransfertBaseUrl,
      transfertDraftByIp: etat.transfertDraftByIp,
      transfertLastStatusByIp: etat.transfertLastStatusByIp,
      demarrerTransfert: (raspberry, fichier, draft) => {
        void controleur.demarrerTransfertVersPi(raspberry, fichier, draft);
      },
      annulerTransfert: () => controleur.annulerTransfertCourant(),
      lancerAgentTransfert: () => controleur.lancerAgentTransfert(),
      get agentTransfertActif() {
        return etat.agentTransfertActif;
      },
    };
  }

  public ouvrirFenetreTransfert(raspberry: Raspberry): void {
    this.view.fenetreTransfert.ouvrir(raspberry, this.obtenirHoteTransfert());
  }

  public async listerFichiersSonSurPi(
    ip: string
  ): Promise<
    | { ok: true; fichiers: string[]; remoteDirectory: string }
    | { ok: false; error: string }
  > {
    return this.agentTransfert.listerFichiersSonSurPi(ip);
  }

  public async creerOuAllerVersPiste(raspberry: Raspberry): Promise<void> {
    if (!this.liaisonPistes) {
      window.alert("Liaison pistes WAM non disponible.");
      return;
    }
    const raspberryId = extraireNumeroRaspberryDepuisIp(raspberry.ip);
    if (!raspberryId) {
      window.alert(`Adresse IP invalide : ${raspberry.ip}`);
      return;
    }
    try {
      const resultat = await this.liaisonPistes.creerOuAllerVersPiste(
        raspberry.ip,
        raspberryId
      );
      if (resultat.type === "cree") {
        logTransfertInfo(
          `Piste creee : ${resultat.nomPiste} (liee a ${raspberry.ip}, son ${resultat.binding.sonNumber})`
        );
      }
      this.rafraichirPanneauDetailsSiSelectionne(raspberry.ip, { forcer: true });
    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : String(erreur);
      window.alert(`Impossible de lier la piste : ${message}`);
    }
  }

  public lireStatutEnvoiPiste(ip: string): string | undefined {
    return this.state.transfertLastStatusByIp.get(ip)?.text;
  }

  public async envoyerPisteVersRaspberry(raspberry: Raspberry): Promise<void> {
    const binding = this.liaisonPistes?.lireBindingPourIp(raspberry.ip);
    if (!binding || !this.exportPistes) {
      window.alert("Aucune piste liee a ce Raspberry.");
      return;
    }
    if (!raspberry.isOnline) {
      window.alert("Raspberry hors ligne.");
      return;
    }

    this.ipTransfertCourant = raspberry.ip;
    mettreAJourStatutTransfertPanneau(this.state, raspberry.ip, {
      ok: true,
      state: "EXPORTING",
      text: "Export de la piste en cours...",
      uploadPercent: 0,
      scpPercent: 0,
    });
    this.rafraichirPanneauDetailsSiSelectionne(raspberry.ip, { forcer: true });

    const preparation = await this.exportPistes.preparerExportPiste(raspberry, binding);
    if (!preparation.ok) {
      this.signalerErreurTransfert(preparation.erreur);
      this.rafraichirPanneauDetailsSiSelectionne(raspberry.ip, { forcer: true });
      return;
    }

    const sante = await this.agentTransfert.verifierSante();
    if (!sante.ok) {
      this.signalerErreurTransfert(
        sante.error ||
          "Agent de transfert indisponible (port 3100). Lancez l'agent puis reessayez."
      );
      this.rafraichirPanneauDetailsSiSelectionne(raspberry.ip, { forcer: true });
      return;
    }

    mettreAJourStatutTransfertPanneau(this.state, raspberry.ip, {
      ok: true,
      state: "RECEIVING",
      text: `Envoi vers ${raspberry.ip} (${preparation.fichier.name})...`,
      uploadPercent: 0,
      scpPercent: 0,
    });
    this.rafraichirPanneauDetailsSiSelectionne(raspberry.ip, { forcer: true });

    logTransfertInfo("Envoi piste liee", {
      ip: raspberry.ip,
      trackId: binding.trackId,
      fichier: preparation.fichier.name,
    });

    await this.agentTransfert.envoyerFichierComplet(
      preparation.fichier,
      preparation.formulaire
    );
    this.enregistrerNomRegionApresEnvoiPiste(
      binding,
      preparation.fichier.name,
      preparation.formulaire.sonNumber ?? null,
      preparation.formulaire.nomSon
    );
    this.rafraichirPanneauDetailsSiSelectionne(raspberry.ip, { forcer: true });
    logTransfertInfo("Envoi piste liee termine", { ip: raspberry.ip });
  }

  private enregistrerNomRegionApresEnvoiPiste(
    binding: RaspberryTrackBinding,
    nomFichier: string,
    sonNumber: number | null,
    libelle?: string
  ): void {
    if (!this.pontPistes) {
      return;
    }
    const regions = this.pontPistes.listerRegionsAudioPiste(binding.trackId);
    const region = regions.length === 1 ? regions[0] : undefined;
    if (!region) {
      return;
    }
    nommerRegionApresEnregistrement(this.pontPistes, {
      trackId: binding.trackId,
      regionId: region.regionId,
      raspberryId: binding.raspberryId,
      startMs: region.startMs,
      durationMs: region.durationMs,
      nomFichier,
      sonNumber,
      libelle,
      indexOrdre: 0,
    });
  }

  public ouvrirFenetreEnvoiAudio(): void {
    if (!this.envoiAudioLot) {
      window.alert("Liaison pistes WAM non disponible.");
      return;
    }
    this.state.refreshOnlineStateFromHeartbeat();
    const cibles = this.envoiAudioLot.listerCibles(Array.from(this.state.raspberryMap.values()));
    ouvrirFenetreEnvoiAudio({
      cibles,
      onEnvoyer: (selections, controle) => this.envoyerAudioVersIps(selections, controle),
      onAnnuler: () => this.annulerTransfertCourant(),
    });
  }

  public ouvrirFenetreSuppressionAudio(): void {
    this.state.refreshOnlineStateFromHeartbeat();
    const cibles = this.suppressionAudio.listerCibles(Array.from(this.state.raspberryMap.values()));
    ouvrirFenetreSuppressionAudio({
      cibles,
      listerSons: (ip) => this.suppressionAudio.listerSons(ip),
      onSupprimer: async (selection) => {
        const cible = cibles.find((item) => item.ip === selection.ip);
        const nomAffichage = cible?.nomAffichage ?? selection.ip;
        const sante = await this.agentTransfert.verifierSante();
        if (!sante.ok) {
          return {
            ok: false,
            message: sante.error || "Agent de transfert indisponible (port 3100).",
          };
        }
        const resultat = await this.suppressionAudio.supprimerSons(
          selection.ip,
          nomAffichage,
          selection.fichiers
        );
        if (resultat.supprimes.length > 0) {
          retirerLibellesSons(selection.ip, resultat.supprimes);
          invaliderCacheFichiersSonPi(selection.ip);
          this.rafraichirPanneauDetailsSiSelectionne(selection.ip, { forcer: true });
        }
        return { ok: resultat.ok, message: `${resultat.nomAffichage} : ${resultat.message}` };
      },
    });
  }

  public ouvrirFenetreImportAudio(): void {
    if (!this.importAudio || !this.liaisonPistes) {
      window.alert("Liaison pistes WAM non disponible.");
      return;
    }
    this.state.refreshOnlineStateFromHeartbeat();
    const cibles = this.importAudio.listerCibles(Array.from(this.state.raspberryMap.values()));
    ouvrirFenetreImportAudio({
      cibles,
      listerSons: (ip) => this.importAudio!.listerSons(ip),
      onImporter: async (selection) => {
        const cible = cibles.find((item) => item.ip === selection.ip);
        const nomAffichage = cible?.nomAffichage ?? selection.ip;
        const sante = await this.agentTransfert.verifierSante();
        if (!sante.ok) {
          return {
            ok: false,
            message: sante.error || "Agent de transfert indisponible (port 3100).",
          };
        }
        const resultat = await this.importAudio!.importerSons(
          selection.ip,
          nomAffichage,
          selection.raspberryId,
          selection.fichiers
        );
        return { ok: resultat.ok, message: `${resultat.nomAffichage} : ${resultat.message}` };
      },
    });
  }

  private async envoyerAudioVersIps(
    selections: SelectionEnvoiAudio[],
    controle: ControleFenetreEnvoiAudio
  ): Promise<ResultatEnvoiUnitaire[]> {
    if (!this.envoiAudioLot) {
      return selections.map((selection) => ({
        ip: selection.ip,
        nomAffichage: selection.ip,
        ok: false,
        message: "Service d'envoi indisponible.",
      }));
    }

    const sante = await this.agentTransfert.verifierSante();
    if (!sante.ok) {
      const message =
        sante.error ||
        "Agent de transfert indisponible (port 3100). Lancez l'agent puis reessayez.";
      return selections.map((selection) => ({
        ip: selection.ip,
        nomAffichage: selection.ip,
        ok: false,
        message,
      }));
    }

    const lots = selections
      .map((selection) => {
        const raspberry = this.state.raspberryMap.get(selection.ip);
        if (!raspberry) {
          return undefined;
        }
        return { raspberry, options: selection.options };
      })
      .filter(
        (item): item is { raspberry: Raspberry; options: SelectionEnvoiAudio["options"] } =>
          item !== undefined
      );

    this.callbackProgressionEnvoi = controle;
    this.envoiLotTotal = lots.length;
    const resultats: ResultatEnvoiUnitaire[] = [];

    try {
      for (let index = 0; index < lots.length; index++) {
        const lot = lots[index];
        if (!lot) {
          continue;
        }
        const { raspberry, options } = lot;
        this.envoiLotIndex = index + 1;
        this.envoiLotNom = formaterNomAffichageRaspberry(raspberry.ip, raspberry.info);
        this.ipTransfertCourant = raspberry.ip;
        this.afficherProgressionEnvoi("Export de la piste...", 0, 0);
        const resultat = await this.envoiAudioLot.envoyerVersUn(
          raspberry,
          (info) => this.suivreProgressionLot(info),
          options
        );
        resultats.push(resultat);
        if (resultat.ok) {
          invaliderCacheFichiersSonPi(resultat.ip);
        }
        mettreAJourStatutTransfertPanneau(this.state, resultat.ip, {
          ok: resultat.ok,
          state: resultat.ok ? "COMPLETED" : "FAILED",
          text: resultat.message,
          uploadPercent: resultat.ok ? 100 : 0,
          scpPercent: resultat.ok ? 100 : 0,
        });
        this.afficherProgressionEnvoi(
          resultat.message,
          resultat.ok ? 100 : 0,
          resultat.ok ? 100 : 0
        );
        this.rafraichirPanneauDetailsSiSelectionne(resultat.ip, { forcer: true });
      }
    } finally {
      this.callbackProgressionEnvoi = null;
    }
    return resultats;
  }

  private suivreProgressionLot(info: ProgressionLotEnvoi): void {
    this.ipTransfertCourant = info.ip;
    this.envoiLotFichierIndex = info.indexFichier;
    this.envoiLotFichierTotal = info.totalFichiers;
    this.envoiLotFichierNom = info.nomFichier ?? "";
    mettreAJourStatutTransfertPanneau(this.state, info.ip, {
      ok: true,
      state: "SENDING",
      text: info.texte,
      uploadPercent: info.resetProgression ? 0 : undefined,
      scpPercent: info.resetProgression ? 0 : undefined,
    });
    this.relayerProgressionEnvoiAudio();
    this.rafraichirPanneauDetailsSiSelectionne(info.ip, { forcer: true });
  }

  private afficherProgressionEnvoi(
    texte: string,
    uploadPercent: number,
    scpPercent: number
  ): void {
    this.callbackProgressionEnvoi?.afficherProgression({
      nomAffichage: this.envoiLotNom,
      texte,
      uploadPercent,
      scpPercent,
      indexCourant: this.envoiLotIndex,
      total: this.envoiLotTotal,
      indexFichier: this.envoiLotFichierIndex,
      totalFichiers: this.envoiLotFichierTotal,
      nomFichier: this.envoiLotFichierNom,
    });
  }

  private obtenirHoteNavigation(): HoteNavigation {
    const controleur = this;
    return {
      listPanel: controleur.view.listPanel,
      raspberryList: controleur.view.raspberryList,
      detailsBox: controleur.view.detailsBox,
      onAfficherListe: () => controleur.rafraichirListe(),
      onSynchroniserDepuisReseau: () => controleur.synchroniserDepuisReseau(),
    };
  }

  public synchroniserDepuisReseau(): void {
    this.view.definirStatut("Scan du reseau 192.168.1.x en cours (quelques secondes)...");
    const envoye = this.envoyerMessage({ type: "syncRaspberryFromNetwork" });
    if (!envoye) {
      this.view.definirStatut("Connexion au serveur requise. Lancez le serveur Raspberry puis reessayez.");
    }
  }

  private obtenirHoteApplicateurMessages(): SearchRaspberryHoteApplicateurMessages {
    const controleur = this;
    const etat = controleur.state;
    return {
      raspberryMap: etat.raspberryMap,
      selectedRaspberryIp: etat.selectedRaspberryIp,
      oscLastStatusByIp: etat.oscLastStatusByIp,
      upsertRaspberry: (...args) => etat.upsertRaspberry(...args),
      isExpectedIp: (ip) => etat.isExpectedIp(ip),
      markAllRaspberriesOffline: () => etat.markAllRaspberriesOffline(),
      setStatus: (text) => controleur.view.definirStatut(text),
      sendMessage: (message) => controleur.envoyerMessage(message),
      rafraichirPanneauDetailsSiSelectionne: (ip) => controleur.rafraichirPanneauDetailsSiSelectionne(ip),
      synchroniserEtatParc: (payload) => controleur.synchroniserEtatParcDepuisServeur(payload),
      synchroniserListeAttendueDepuisIps: (ips) => etat.updateActiveExpectedFromIps(ips),
      renderList: () => controleur.rafraichirListe(),
      mettreAJourEtatAgentTransfert: (running, message) =>
        controleur.mettreAJourEtatAgentTransfert(running, message),
    };
  }

  private synchroniserEtatParcDepuisServeur(payload: Record<string, unknown>): void {
    if (typeof payload.subnetPrefix === "string" && payload.subnetPrefix.length > 0) {
      this.state.subnetPrefix = payload.subnetPrefix;
    }
    const listenNumbers = Array.isArray(payload.listenNumbers)
      ? payload.listenNumbers
          .map((value: unknown) => Number.parseInt(`${value}`, 10))
          .filter((value: number) => Number.isFinite(value))
      : Array.isArray(payload.activeNumbers)
        ? (payload.activeNumbers as unknown[])
            .map((value) => Number.parseInt(`${value}`, 10))
            .filter((value: number) => Number.isFinite(value))
        : [];
    if (listenNumbers.length > 0) {
      this.state.updateActiveExpectedFromNumbers(listenNumbers);
    }
  }

  private async traiterMessageServeur(rawData: unknown): Promise<void> {
    await traiterMessageBrutServeur(this.obtenirHoteApplicateurMessages(), rawData);
    this.rafraichirListe();
    void this.synchroniserPistesPourRaspberryEnLigne();
  }

  private rafraichirListe(): void {
    this.state.refreshOnlineStateFromHeartbeat();
    rafraichirListeRaspberry(this.obtenirHoteListe());
    rafraichirDisponibiliteCasesLiaison();
  }

  private rafraichirPanneauDetailsSiSelectionne(ip: string, options?: { forcer?: boolean }): void {
    rafraichirDetailsSiSelection(this.obtenirHoteListe(), ip, options);
  }

  private mettreAJourDomTransfertSiPossible(ip: string): boolean {
    const statut = this.state.transfertLastStatusByIp.get(ip);
    if (!statut) return false;
    const panel = this.view.fenetreTransfert.lireConteneurPanel(ip);
    if (!panel) return false;
    appliquerEtatAgentDansDom(panel, this.state.agentTransfertActif, statut);
    return appliquerStatutTransfertDansDom(panel, statut, this.state.agentTransfertActif);
  }

  private rafraichirFenetreTransfert(ip: string, options?: { forcer?: boolean }): void {
    const raspberry = this.state.raspberryMap.get(ip);
    if (!raspberry) return;
    this.view.fenetreTransfert.rafraichir(raspberry, this.obtenirHoteTransfert(), options);
  }

  private lireIpTransfertActive(): string | null {
    return this.ipTransfertCourant || this.view.fenetreTransfert.lireIpCourante();
  }

  private demarrerBoucleRafraichissementListe(): void {
    if (this.listRefreshTimer !== null) {
      return;
    }
    this.listRefreshTimer = window.setInterval(() => {
      if (!this.view.estFenetreVisible() && !this.surveillanceAutoPistesActive) {
        return;
      }
      this.rafraichirListe();
    }, 1000);
  }

  private arreterBoucleRafraichissementListe(): void {
    if (this.listRefreshTimer === null) {
      return;
    }
    window.clearInterval(this.listRefreshTimer);
    this.listRefreshTimer = null;
  }

  private async initialiserAgentTransfert(): Promise<void> {
    if (!this.surveillanceAgentTransfertActive) {
      return;
    }
    demarrerTimerSurveillanceAgent(
      this.obtenirHoteLancementAgent(),
      3000,
      () => this.agentStatusTimer,
      (timer) => {
        this.agentStatusTimer = timer;
      },
      () => this.surveillanceAgentTransfertActive
    );
    await synchroniserEtatAgent(this.obtenirHoteLancementAgent());
    const sante = await this.agentTransfert.verifierSante();
    if (sante.ok) {
      await this.agentTransfert.connecter();
    }
  }

  private activerSurveillanceAgentTransfert(): void {
    if (this.surveillanceAgentTransfertActive) {
      void this.initialiserAgentTransfert();
      return;
    }
    this.surveillanceAgentTransfertActive = true;
    void this.initialiserAgentTransfert();
  }

  private desactiverSurveillanceAgentTransfert(): void {
    this.surveillanceAgentTransfertActive = false;
    this.dernierEtatAgentConnu = null;
    arreterTimerSurveillanceAgent(
      () => this.agentStatusTimer,
      (timer) => {
        this.agentStatusTimer = timer;
      }
    );
  }

  private obtenirHoteLancementAgent(): HoteLancementAgent {
    const controleur = this;
    return {
      agentBaseUrl: controleur.state.agentTransfertBaseUrl,
      afficherStatut: (text) => controleur.view.definirStatut(text),
      envoyerMessage: (message) => controleur.envoyerMessage(message),
      mettreAJourEtatAgent: (actif) => {
        if (controleur.dernierEtatAgentConnu !== actif) {
          controleur.dernierEtatAgentConnu = actif;
          if (actif) {
            logTransfertInfo("Agent actif");
          }
        }
        controleur.state.agentTransfertActif = actif;
        const ip = controleur.lireIpTransfertActive();
        if (!ip) return;
        const precedent = controleur.state.transfertLastStatusByIp.get(ip);
        if (precedent) {
          mettreAJourStatutTransfertPanneau(controleur.state, ip, {
            agentConnecte: actif || precedent.agentConnecte,
          });
        }
        if (!controleur.mettreAJourDomTransfertSiPossible(ip)) {
          controleur.rafraichirFenetreTransfert(ip);
        }
      },
    };
  }

  private tenterDemarrageAutomatiqueAgent(): void {
    if (
      !this.surveillanceAutoPistesActive ||
      this.demarrageAutoAgentEnCours ||
      this.demarrageAutoAgentAbandonne
    ) {
      return;
    }
    if (this.dernierEtatAgentConnu === true || this.state.agentTransfertActif) {
      return;
    }
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.demarrageAutoAgentEnCours = true;
    void (async () => {
      try {
        const dejaActif = await synchroniserEtatAgent(this.obtenirHoteLancementAgent());
        if (dejaActif) {
          this.activerSurveillanceAgentTransfert();
          return;
        }
        const pret = await assurerAgentTransfertDemarreAutomatiquement(this.obtenirHoteLancementAgent());
        if (pret) {
          this.activerSurveillanceAgentTransfert();
        } else {
          this.demarrageAutoAgentAbandonne = true;
        }
      } finally {
        this.demarrageAutoAgentEnCours = false;
      }
    })();
  }

  public lancerAgentTransfert(): void {
    this.activerSurveillanceAgentTransfert();
    void lancerAgentTransfertDepuisUi(this.obtenirHoteLancementAgent()).then((pret) => {
      if (pret) {
        void this.agentTransfert.connecter();
      }
    });
  }

  public mettreAJourEtatAgentTransfert(running: boolean, message?: string): void {
    this.state.agentTransfertActif = running;
    if (running) {
      this.activerSurveillanceAgentTransfert();
    }
    if (message) {
      this.view.definirStatut(message);
    }
    const ip = this.lireIpTransfertActive();
    if (ip && !this.mettreAJourDomTransfertSiPossible(ip)) {
      this.rafraichirFenetreTransfert(ip);
    }
    if (running) {
      void this.agentTransfert.connecter();
    }
  }

  private async demarrerTransfertVersPi(raspberry: Raspberry, fichier: File, draft: TransfertDraft): Promise<void> {
    this.ipTransfertCourant = raspberry.ip;
    const raspberryId = extraireNumeroRaspberryDepuisIp(raspberry.ip);
    logTransfertInfo("Demarrage transfert", {
      ip: raspberry.ip,
      raspberryId,
      fichier: fichier.name,
    });
    if (!raspberryId) {
      this.signalerErreurTransfert("Impossible de deduire l'ID Raspberry depuis l'IP.");
      return;
    }

    const sante = await this.agentTransfert.verifierSante();
    if (!sante.ok) {
      logTransfertErreur("Agent indisponible avant transfert", sante.error);
      this.signalerErreurTransfert(
        sante.error ||
          "Agent de transfert indisponible (port 3100). Cliquez « Lancer l'agent », attendez le point vert, puis reessayez."
      );
      return;
    }

    mettreAJourStatutTransfertPanneau(this.state, raspberry.ip, {
      ok: true,
      state: "RECEIVING",
      text: `Transfert en cours vers ${raspberry.ip}...`,
      uploadPercent: 0,
      scpPercent: 0,
    });
    this.rafraichirFenetreTransfert(raspberry.ip, { forcer: true });

    const formulaire: TransfertFormulaire = {
      ...draft,
      sshHost: raspberry.ip,
      sshPort: 22,
      sshUsername: "pi",
      raspberryId,
    };

    await this.agentTransfert.envoyerFichierComplet(fichier, formulaire);
    this.rafraichirFenetreTransfert(raspberry.ip, { forcer: true });
    logTransfertInfo("Flux transfert termine cote controller", { ip: raspberry.ip });
  }

  private annulerTransfertCourant(): void {
    this.agentTransfert.annulerTransfertCourant();
    if (this.ipTransfertCourant) {
      mettreAJourStatutTransfertPanneau(this.state, this.ipTransfertCourant, {
        ok: false,
        state: "CANCELLED",
        text: "Annulation demandee.",
      });
      this.rafraichirFenetreTransfert(this.ipTransfertCourant, { forcer: true });
    }
  }

  private mettreAJourConnexionAgent(connecte: boolean): void {
    const ip = this.lireIpTransfertActive();
    logTransfertInfo(connecte ? "Socket.IO connecte" : "Socket.IO deconnecte", { ip });
    if (!ip) return;
    const precedent = this.state.transfertLastStatusByIp.get(ip);
    mettreAJourStatutTransfertPanneau(this.state, ip, {
      agentConnecte: connecte || this.state.agentTransfertActif,
      text: precedent?.text || (connecte ? "Agent connecte." : "Agent deconnecte."),
    });
    this.mettreAJourDomTransfertSiPossible(ip);
  }

  private traiterEvenementTransfert(event: {
    type: string;
    state?: string;
    phase?: string;
    percent?: number;
    current?: number;
    total?: number;
    speed?: number;
    remainingSeconds?: number;
    message?: string;
  }): void {
    const ip = this.lireIpTransfertActive();
    if (!ip) return;

    const precedent = this.state.transfertLastStatusByIp.get(ip);
    let uploadPercent = precedent?.uploadPercent ?? 0;
    let scpPercent = precedent?.scpPercent ?? 0;
    let state = precedent?.state ?? "IDLE";
    let text = precedent?.text ?? "";

    if (event.type === "progress" && event.phase === "upload") {
      uploadPercent = event.percent ?? uploadPercent;
      if (precedent?.state !== "READY" && precedent?.state !== "SENDING") {
        text = "Envoi du fichier vers l'agent local...";
      }
    }
    if (event.type === "progress" && event.phase === "scp") {
      scpPercent = event.percent ?? scpPercent;
      text = "Envoi vers le Raspberry (SSH)...";
    }
    if (event.type === "state" && event.state) {
      if (event.state === "FAILED" && precedent?.state === "FAILED") {
        return;
      }
      state = event.state;
      text = `Etat: ${event.state}`;
      if (event.state === "RECEIVING") {
        text = "Envoi du fichier vers l'agent local...";
      }
      if (event.state === "VERIFYING") {
        text = "Verification du fichier...";
        uploadPercent = Math.max(uploadPercent, 100);
      }
      if (event.state === "READY") {
        text = "Fichier pret. Connexion SSH au Raspberry...";
        uploadPercent = Math.max(uploadPercent, 100);
      }
      if (event.state === "SENDING") {
        uploadPercent = Math.max(uploadPercent, 100);
        text =
          scpPercent > 0
            ? "Envoi vers le Raspberry (SSH)..."
            : "Connexion SSH au Raspberry... (cela peut prendre quelques secondes)";
      }
      if (event.state === "COMPLETED") {
        text = "Transfert termine avec succes sur le Raspberry.";
        uploadPercent = 100;
        scpPercent = 100;
      }
      if (event.state === "FAILED") {
        text = event.message || precedent?.text || "Transfert echoue.";
      }
    }
    if (event.type === "completed") {
      state = "COMPLETED";
      text = "Transfert SCP termine avec succes.";
    }
    if (event.type === "error") {
      state = "FAILED";
      text = event.message || "Erreur de transfert.";
      logTransfertErreur("Evenement erreur transfert", event);
    }

    // Eviter de journaliser les evenements de `progress` (trop frequent).
    if (event.type !== "progress") {
      // Les erreurs sont deja journalisees via logTransfertErreur.
      if (event.type !== "error") {
        logTransfertInfo("Evenement transfert", event);
      }
    }

    mettreAJourStatutTransfertPanneau(this.state, ip, {
      ok: state !== "FAILED" && state !== "CANCELLED",
      state: state === "FAILED" || state === "CANCELLED" ? "IDLE" : state,
      text:
        state === "FAILED" || state === "CANCELLED"
          ? formaterTexteErreurTransfert(text)
          : text,
      uploadPercent: state === "FAILED" || state === "CANCELLED" ? 0 : uploadPercent,
      scpPercent: state === "FAILED" || state === "CANCELLED" ? 0 : scpPercent,
      agentConnecte: this.state.agentTransfertActif || precedent?.agentConnecte,
    });

    const etatTerminal = state === "COMPLETED" || state === "FAILED" || state === "CANCELLED";
    if (!this.mettreAJourDomTransfertSiPossible(ip)) {
      this.rafraichirFenetreTransfert(ip, etatTerminal ? { forcer: true } : undefined);
    } else if (event.type === "progress") {
      const panel = this.view.fenetreTransfert.lireConteneurPanel(ip);
      const detailUpload = panel?.querySelector<HTMLElement>("[data-transfert-detail-upload]");
      const detailScp = panel?.querySelector<HTMLElement>("[data-transfert-detail-scp]");
      const status = panel?.querySelector<HTMLElement>("[data-transfert-status]");
      if (event.phase === "upload" && detailUpload) {
        detailUpload.textContent = texteProgressionTransfert("upload", event);
      }
      if (event.phase === "scp" && detailScp) {
        detailScp.textContent = texteProgressionTransfert("scp", event);
      }
      if (status) status.innerText = text;
    }

    if (event.type !== "progress") {
      this.rafraichirPanneauDetailsSiSelectionne(ip);
    }
    this.relayerProgressionEnvoiAudio();
  }

  private relayerProgressionEnvoiAudio(): void {
    if (!this.callbackProgressionEnvoi || !this.ipTransfertCourant) {
      return;
    }
    const statut = this.state.transfertLastStatusByIp.get(this.ipTransfertCourant);
    if (!statut) {
      return;
    }
    const scpLibelle =
      statut.scpPercent <= 0 && (statut.state === "READY" || statut.state === "SENDING")
        ? "Envoi vers le Raspberry : connexion SSH en cours..."
        : `Envoi vers le Raspberry : ${Math.round(statut.scpPercent)}%`;
    this.callbackProgressionEnvoi.afficherProgression({
      nomAffichage: this.envoiLotNom,
      texte: statut.text,
      uploadPercent: statut.uploadPercent,
      scpPercent: statut.scpPercent,
      uploadLibelle: `Upload : ${Math.round(statut.uploadPercent)}%`,
      scpLibelle,
      indexCourant: this.envoiLotIndex,
      total: this.envoiLotTotal,
      indexFichier: this.envoiLotFichierIndex,
      totalFichiers: this.envoiLotFichierTotal,
      nomFichier: this.envoiLotFichierNom,
    });
  }

  private signalerErreurTransfert(message: string): void {
    logTransfertErreur("Echec transfert", message);
    const ip = this.lireIpTransfertActive();
    if (ip) {
      const precedent = this.state.transfertLastStatusByIp.get(ip);
      if (precedent?.state === "FAILED" || precedent?.text?.startsWith("Erreur:")) {
        return;
      }
      mettreAJourStatutTransfertPanneau(this.state, ip, {
        ok: false,
        state: "IDLE",
        text: formaterTexteErreurTransfert(message),
        uploadPercent: 0,
        scpPercent: 0,
        agentConnecte: this.state.agentTransfertActif,
      });
      if (!this.mettreAJourDomTransfertSiPossible(ip)) {
        this.rafraichirFenetreTransfert(ip, { forcer: true });
      }
    } else {
      this.view.definirStatut(message);
    }
  }
}
