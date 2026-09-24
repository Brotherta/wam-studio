import type {
  EvenementSequenceurOsc,
  RaspberryProgramme,
} from "../Services/RaspberrySequenceurOscService";
import {
  actualiserCommandeOscEvenement,
  construireTexteLogAttenteComposition,
  construireTexteLogComposition,
  listerRaspberriesPourStop,
  reporterNiveauxProgramme,
  signatureProgrammeSequenceur,
} from "../Services/RaspberrySequenceurOscService";
import { creerJoueurSequenceur } from "../Services/RaspberrySequenceurJoueur";
import { formaterTempsPiste } from "../utils/osc/FormatTempsPiste";
import { lireNiveauPlay } from "../utils/osc/OscPlayHelpers";
import {
  DELAI_APRES_COMPOSITION_MS,
  lancerLectureSequenceur,
  type ControleLectureSequenceur,
} from "../Services/RaspberrySequenceurLecture";
import { activerDeplacementFenetre } from "./sequenceur/activerDeplacementFenetre";
import { lireMarqueursSequenceur } from "../Services/RaspberryMarqueursStore";
import {
  construireTexteLogMarqueur,
  estEvenementCue,
  estEvenementMarqueur,
  fusionnerProgrammeEtMarqueurs,
  parserAdresseOscPersonnalisee,
} from "../Services/RaspberryMarqueursSequenceur";
import { appliquerEffetOscSurPistes } from "../Services/RaspberryMarqueursOscPisteEffet";

const ID_OVERLAY = "raspberry-sequenceur-osc-overlay";
const FILTRE_TOUS = "tous";
const INTERVALLE_SYNC_PISTES_MS = 400;

type LigneLog = {
  raspberryId: number | null;
  texte: string;
};

function fermerOverlay(): void {
  const existant = document.getElementById(ID_OVERLAY);
  existant?.dispatchEvent(new Event("raspberry-sequenceur-fermer"));
  existant?.remove();
}

function appliquerStyleOverlay(overlay: HTMLDivElement): void {
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "transparent";
  overlay.style.zIndex = "2000";
  overlay.style.pointerEvents = "none";
}

function appliquerStyleModal(modal: HTMLDivElement): void {
  modal.style.position = "fixed";
  modal.style.top = "72px";
  modal.style.right = "24px";
  modal.style.background = "#1f252b";
  modal.style.color = "#f1f1f1";
  modal.style.padding = "12px 16px 16px";
  modal.style.border = "1px solid #3b4046";
  modal.style.borderRadius = "8px";
  modal.style.width = "min(560px, 92vw)";
  modal.style.maxHeight = "80vh";
  modal.style.overflow = "hidden";
  modal.style.display = "flex";
  modal.style.flexDirection = "column";
  modal.style.gap = "8px";
  modal.style.pointerEvents = "auto";
  modal.style.boxShadow = "0 10px 28px rgba(0, 0, 0, 0.45)";
}

function creerZoneTexte(): HTMLDivElement {
  const zone = document.createElement("div");
  zone.style.border = "1px solid #3b4046";
  zone.style.borderRadius = "6px";
  zone.style.padding = "8px";
  zone.style.overflow = "auto";
  zone.style.fontSize = "12px";
  zone.style.whiteSpace = "pre-wrap";
  zone.style.fontFamily = "Consolas, monospace";
  zone.style.background = "#161a1e";
  zone.style.flex = "1";
  zone.style.minHeight = "120px";
  return zone;
}

function creerBouton(
  libelle: string,
  options?: { primaire?: boolean; danger?: boolean }
): HTMLButtonElement {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.innerText = libelle;
  bouton.style.padding = "6px 14px";
  bouton.style.borderRadius = "4px";
  bouton.style.border = "1px solid #3b4046";
  bouton.style.background = "#2a3038";
  bouton.style.color = "#f1f1f1";
  bouton.style.cursor = "pointer";
  if (options?.primaire) {
    bouton.style.background = "#2e7d32";
    bouton.style.border = "none";
  }
  if (options?.danger) {
    bouton.style.background = "#8b3a3a";
    bouton.style.border = "none";
  }
  return bouton;
}

function lireNomSon(evenement: EvenementSequenceurOsc): string {
  if (evenement.nomAffiche && evenement.nomAffiche !== "son ?") {
    return evenement.nomAffiche;
  }
  if (evenement.sonNumber !== null) {
    return `son${evenement.sonNumber}`;
  }
  return "son ?";
}

function creerEnteteColonne(texte: string): HTMLTableCellElement {
  const cellule = document.createElement("th");
  cellule.innerText = texte;
  cellule.style.textAlign = "left";
  cellule.style.padding = "8px 10px";
  cellule.style.borderBottom = "1px solid #3b4046";
  cellule.style.fontSize = "12px";
  cellule.style.fontWeight = "600";
  cellule.style.position = "sticky";
  cellule.style.top = "0";
  cellule.style.background = "#1f252b";
  cellule.style.zIndex = "1";
  return cellule;
}

function creerCellule(): HTMLTableCellElement {
  const cellule = document.createElement("td");
  cellule.style.padding = "6px 10px";
  cellule.style.borderBottom = "1px solid #2a3038";
  cellule.style.fontSize = "12px";
  cellule.style.verticalAlign = "middle";
  return cellule;
}

function creerInputNiveau(
  evenement: EvenementSequenceurOsc,
  onChange: () => void
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "number";
  input.min = "0";
  input.max = "127";
  input.value = String(evenement.niveau);
  input.style.width = "64px";
  input.style.padding = "4px 6px";
  input.style.borderRadius = "4px";
  input.style.border = "1px solid #3b4046";
  input.style.background = "#161a1e";
  input.style.color = "#f1f1f1";
  input.title = "Niveau OSC /play (0–127)";
  input.addEventListener("change", () => {
    evenement.niveau = lireNiveauPlay(input.value);
    input.value = String(evenement.niveau);
    actualiserCommandeOscEvenement(evenement);
    onChange();
  });
  return input;
}

function creerTableauProgramme(
  programme: EvenementSequenceurOsc[],
  onNiveauChange: () => void
): HTMLDivElement {
  const conteneur = document.createElement("div");
  conteneur.style.border = "1px solid #3b4046";
  conteneur.style.borderRadius = "6px";
  conteneur.style.background = "#161a1e";
  conteneur.style.overflow = "auto";
  conteneur.style.flex = "1";
  conteneur.style.minHeight = "140px";
  conteneur.style.maxHeight = "42vh";

  if (programme.length === 0) {
    conteneur.style.padding = "12px";
    conteneur.style.fontSize = "12px";
    conteneur.style.color = "#aab0b6";
    conteneur.innerText = "Aucune région ni marqueur pour l'instant.";
    return conteneur;
  }

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const entete = document.createElement("thead");
  const ligneEntete = document.createElement("tr");
  for (const titre of ["Piste", "Son", "Debut", "Fin", "Niveau"]) {
    ligneEntete.appendChild(creerEnteteColonne(titre));
  }
  entete.appendChild(ligneEntete);
  table.appendChild(entete);

  const corps = document.createElement("tbody");
  for (const evenement of programme) {
    const ligne = document.createElement("tr");

    const piste = creerCellule();
    piste.innerText = evenement.nomPiste;
    ligne.appendChild(piste);

    const son = creerCellule();
    son.innerText = lireNomSon(evenement);
    ligne.appendChild(son);

    const debut = creerCellule();
    debut.innerText = formaterTempsPiste(evenement.startMs);
    ligne.appendChild(debut);

    const fin = creerCellule();
    fin.innerText = estEvenementMarqueur(evenement) ? "—" : formaterTempsPiste(evenement.endMs);
    ligne.appendChild(fin);

    const niveau = creerCellule();
    if (estEvenementMarqueur(evenement)) {
      niveau.innerText = estEvenementCue(evenement) ? "Cue (Espace)" : evenement.commandeOsc;
      ligne.style.background = estEvenementCue(evenement)
        ? "rgba(253, 216, 53, 0.12)"
        : "rgba(255, 152, 0, 0.12)";
    } else {
      niveau.appendChild(creerInputNiveau(evenement, onNiveauChange));
    }
    ligne.appendChild(niveau);

    corps.appendChild(ligne);
  }
  table.appendChild(corps);
  conteneur.appendChild(table);
  return conteneur;
}

function listerRaspberriesDuProgramme(programme: EvenementSequenceurOsc[]): number[] {
  const ids = new Set<number>();
  for (const evenement of programme) {
    if (evenement.raspberryId < 1) {
      continue;
    }
    ids.add(evenement.raspberryId);
  }
  return [...ids].sort((a, b) => a - b);
}

function rafraichirSelectFiltre(
  select: HTMLSelectElement,
  programme: EvenementSequenceurOsc[],
  filtreActif: string
): void {
  const raspberries = listerRaspberriesDuProgramme(programme);
  select.replaceChildren();

  const optionTous = document.createElement("option");
  optionTous.value = FILTRE_TOUS;
  optionTous.text = "Tous les Raspberry";
  select.appendChild(optionTous);

  for (const id of raspberries) {
    const option = document.createElement("option");
    option.value = String(id);
    option.text = `Raspberry ${id}`;
    select.appendChild(option);
  }

  if (filtreActif !== FILTRE_TOUS && raspberries.includes(Number.parseInt(filtreActif, 10))) {
    select.value = filtreActif;
  } else {
    select.value = FILTRE_TOUS;
  }
}

function ligneVisiblePourFiltre(ligne: LigneLog, filtre: string): boolean {
  if (filtre === FILTRE_TOUS) {
    return true;
  }
  if (ligne.raspberryId === null) {
    return true;
  }
  return String(ligne.raspberryId) === filtre;
}

function afficherLogs(
  zoneLogs: HTMLDivElement,
  lignes: LigneLog[],
  filtre: string
): void {
  zoneLogs.innerText = lignes
    .filter((ligne) => ligneVisiblePourFiltre(ligne, filtre))
    .map((ligne) => ligne.texte)
    .join("\n");
  zoneLogs.scrollTop = zoneLogs.scrollHeight;
}

type AjouterLogSequenceur = (texte: string, raspberryId?: number | null) => void;

function envoyerOscVersRaspberry(
  envoyer: (ip: string, raspberryId: number) => { ok: boolean; detail: string },
  raspberry: RaspberryProgramme,
  texteLog: string,
  ajouterLog: AjouterLogSequenceur
): void {
  if (!raspberry.ip) {
    ajouterLog(`${texteLog} — IP introuvable`, raspberry.raspberryId);
    return;
  }
  const envoi = envoyer(raspberry.ip, raspberry.raspberryId);
  ajouterLog(envoi.ok ? texteLog : `${texteLog} — ${envoi.detail}`, raspberry.raspberryId);
}

/**
 * Fenetre flottante : suit les pistes rasp, lance les /play aux timers, journalise.
 */
function preparerRaspberriesAvantLecture(
  raspberries: RaspberryProgramme[],
  envoyerComposition: (ip: string, raspberryId: number) => { ok: boolean; detail: string },
  ajouterLog: AjouterLogSequenceur
): boolean {
  if (raspberries.length === 0) {
    ajouterLog("Aucun Raspberry connecté : /composition non envoyée.");
    return false;
  }
  for (const raspberry of raspberries) {
    envoyerOscVersRaspberry(
      envoyerComposition,
      raspberry,
      construireTexteLogComposition(raspberry.raspberryId, raspberry.ip),
      ajouterLog
    );
  }
  return true;
}

function arreterSonsEnCours(
  programme: EvenementSequenceurOsc[],
  connectes: RaspberryProgramme[],
  envoyerStop: (ip: string, raspberryId: number) => { ok: boolean; detail: string },
  ajouterLog: AjouterLogSequenceur
): void {
  for (const raspberry of listerRaspberriesPourStop(programme, connectes)) {
    envoyerOscVersRaspberry(
      envoyerStop,
      raspberry,
      `[stop] Raspberry ${raspberry.raspberryId}${raspberry.ip ? ` (${raspberry.ip})` : ""}  /stop -1`,
      ajouterLog
    );
  }
}

export function ouvrirFenetreSequenceurOsc(params: {
  copier: () => EvenementSequenceurOsc[];
  formaterLigne: (evenement: EvenementSequenceurOsc) => string;
  listerRaspberriesConnectes: () => RaspberryProgramme[];
  envoyerOsc: (evenement: EvenementSequenceurOsc) => { ok: boolean; detail: string };
  envoyerOscPersonnalise: (
    ip: string,
    raspberryId: number,
    adresse: string,
    valeur: string
  ) => { ok: boolean; detail: string };
  envoyerComposition: (ip: string, raspberryId: number) => { ok: boolean; detail: string };
  envoyerStop: (ip: string, raspberryId: number) => { ok: boolean; detail: string };
  appliquerEffetPiste?: (adresse: string, valeur: string) => void;
}): void {
  fermerOverlay();

  const overlay = document.createElement("div");
  overlay.id = ID_OVERLAY;
  appliquerStyleOverlay(overlay);

  const modal = document.createElement("div");
  appliquerStyleModal(modal);

  const barreTitre = document.createElement("div");
  barreTitre.style.display = "flex";
  barreTitre.style.justifyContent = "space-between";
  barreTitre.style.alignItems = "center";
  barreTitre.style.gap = "12px";
  barreTitre.style.paddingBottom = "4px";
  barreTitre.style.userSelect = "none";

  const titre = document.createElement("h3");
  titre.style.margin = "0";
  titre.innerText = "Sequenceur OSC";
  barreTitre.appendChild(titre);

  const timerAffiche = document.createElement("div");
  timerAffiche.style.fontSize = "18px";
  timerAffiche.style.fontWeight = "600";
  timerAffiche.style.whiteSpace = "nowrap";
  timerAffiche.innerText = "Timer : 0s";
  barreTitre.appendChild(timerAffiche);
  modal.appendChild(barreTitre);
  const arreterDeplacement = activerDeplacementFenetre(barreTitre, modal);

  const hint = document.createElement("div");
  hint.style.fontSize = "12px";
  hint.style.opacity = "0.8";
  hint.innerText =
    "La liste copie les pistes rasp XX et les marqueurs OSC. Les cues (Espace) pausent la lecture WAM. Les OSC changent aussi le volume des pistes WAM.";
  modal.appendChild(hint);

  const bandeauCue = document.createElement("div");
  bandeauCue.style.display = "none";
  bandeauCue.style.padding = "6px 8px";
  bandeauCue.style.borderRadius = "4px";
  bandeauCue.style.background = "rgba(253, 216, 53, 0.2)";
  bandeauCue.style.color = "#ffe082";
  bandeauCue.style.fontSize = "12px";
  bandeauCue.style.fontWeight = "600";
  bandeauCue.innerText = "Cue : appuyez sur Espace pour continuer.";
  modal.appendChild(bandeauCue);

  const labelProgramme = document.createElement("div");
  labelProgramme.style.fontSize = "12px";
  labelProgramme.style.fontWeight = "600";
  labelProgramme.innerText = "Programme (pistes)";
  modal.appendChild(labelProgramme);

  let programme: EvenementSequenceurOsc[] = [];
  let conteneurProgramme = creerTableauProgramme(programme, () => undefined);
  modal.appendChild(conteneurProgramme);

  const barreLogs = document.createElement("div");
  barreLogs.style.display = "flex";
  barreLogs.style.justifyContent = "space-between";
  barreLogs.style.alignItems = "center";
  barreLogs.style.gap = "12px";
  barreLogs.style.marginTop = "4px";

  const labelLogs = document.createElement("div");
  labelLogs.style.fontSize = "12px";
  labelLogs.style.fontWeight = "600";
  labelLogs.innerText = "Logs OSC";
  barreLogs.appendChild(labelLogs);

  const filtreLogs = document.createElement("select");
  filtreLogs.style.padding = "4px 8px";
  filtreLogs.style.borderRadius = "4px";
  filtreLogs.style.border = "1px solid #3b4046";
  filtreLogs.style.background = "#161a1e";
  filtreLogs.style.color = "#f1f1f1";
  filtreLogs.title = "Filtrer les logs par Raspberry";
  barreLogs.appendChild(filtreLogs);
  modal.appendChild(barreLogs);

  const zoneLogs = creerZoneTexte();
  zoneLogs.style.maxHeight = "28vh";
  modal.appendChild(zoneLogs);

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.justifyContent = "flex-end";
  actions.style.gap = "8px";
  actions.style.marginTop = "4px";
  actions.style.flexWrap = "wrap";

  const boutonFermer = creerBouton("Fermer");
  const boutonStop = creerBouton("Stop", { danger: true });
  boutonStop.disabled = true;
  const boutonContinuer = creerBouton("Continuer (Espace)", { primaire: true });
  boutonContinuer.style.display = "none";
  const boutonLancer = creerBouton("Lancer son", { primaire: true });

  let lecture: ControleLectureSequenceur | null = null;
  const lignesLog: LigneLog[] = [];
  let filtreActif = FILTRE_TOUS;
  let timerSync: number | null = null;

  const fermerFenetre = () => {
    if (timerSync !== null) {
      clearInterval(timerSync);
      timerSync = null;
    }
    window.removeEventListener("keydown", onToucheEspace);
    window.removeEventListener("raspberry-marqueurs-change", onMarqueursChange);
    arreterDeplacement();
    fermerOverlay();
  };

  const rafraichirProgramme = () => {
    const parent = conteneurProgramme.parentElement;
    if (!parent) {
      return;
    }
    const suivant = creerTableauProgramme(programme, rafraichirProgramme);
    parent.replaceChild(suivant, conteneurProgramme);
    conteneurProgramme = suivant;
  };

  const synchroniserDepuisPistes = (forcer = false): void => {
    if (lecture && !forcer) {
      return;
    }
    const suivant = fusionnerProgrammeEtMarqueurs(params.copier(), lireMarqueursSequenceur());
    reporterNiveauxProgramme(programme, suivant);
    if (!forcer && signatureProgrammeSequenceur(programme) === signatureProgrammeSequenceur(suivant)) {
      return;
    }
    programme = suivant;
    rafraichirSelectFiltre(filtreLogs, programme, filtreActif);
    rafraichirProgramme();
  };

  function onMarqueursChange(): void {
    synchroniserDepuisPistes(true);
  }

  const ajouterLog = (texte: string, raspberryId: number | null = null) => {
    lignesLog.push({ raspberryId, texte });
    afficherLogs(zoneLogs, lignesLog, filtreActif);
  };

  filtreLogs.addEventListener("change", () => {
    filtreActif = filtreLogs.value;
    afficherLogs(zoneLogs, lignesLog, filtreActif);
  });

  const joueur = creerJoueurSequenceur({
    envoyerOsc: params.envoyerOsc,
    envoyerStop: (evenement) => {
      if (!evenement.ip) {
        return { ok: false, detail: "IP Raspberry introuvable" };
      }
      return params.envoyerStop(evenement.ip, evenement.raspberryId);
    },
    estLectureActive: () => lecture !== null,
    onLog: (texte, raspberryId) => ajouterLog(texte, raspberryId),
  });

  const arreterLecture = (couperSons: boolean) => {
    const etaitEnLecture = lecture !== null;
    lecture?.arreter();
    lecture = null;
    joueur.reinitialiser();
    boutonLancer.disabled = false;
    boutonStop.disabled = true;
    boutonContinuer.style.display = "none";
    bandeauCue.style.display = "none";
    timerAffiche.innerText = "Timer : 0s";
    if (couperSons && etaitEnLecture) {
      arreterSonsEnCours(
        programme,
        params.listerRaspberriesConnectes(),
        params.envoyerStop,
        ajouterLog
      );
    }
  };

  overlay.addEventListener("raspberry-sequenceur-fermer", () => {
    arreterLecture(true);
    if (timerSync !== null) {
      clearInterval(timerSync);
      timerSync = null;
    }
    window.removeEventListener("keydown", onToucheEspace);
    window.removeEventListener("raspberry-marqueurs-change", onMarqueursChange);
    arreterDeplacement();
  });

  const reprendreApresCue = () => {
    if (!lecture?.estEnPauseCue()) {
      return;
    }
    lecture.reprendre();
    boutonContinuer.style.display = "none";
    bandeauCue.style.display = "none";
    ajouterLog("Cue : reprise (Espace).");
  };

  function onToucheEspace(event: KeyboardEvent): void {
    if (event.code !== "Space" && event.key !== " ") {
      return;
    }
    const cible = event.target as HTMLElement | null;
    if (cible && cible.closest("input, textarea, select")) {
      return;
    }
    if (!lecture?.estEnPauseCue()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    reprendreApresCue();
  }

  const envoyerMarqueurOsc = (evenement: EvenementSequenceurOsc): void => {
    const osc = parserAdresseOscPersonnalisee(
      evenement.oscAdresse || evenement.commandeOsc,
      evenement.oscValeur || ""
    );
    if (!osc) {
      ajouterLog(`${construireTexteLogMarqueur(evenement)} — adresse OSC invalide`);
      return;
    }
    params.appliquerEffetPiste?.(osc.message, osc.value);
    const connectes = params.listerRaspberriesConnectes();
    if (connectes.length === 0) {
      ajouterLog(`${construireTexteLogMarqueur(evenement)} — aucun Raspberry connecté`);
      return;
    }
    ajouterLog(construireTexteLogMarqueur(evenement));
    for (const raspberry of connectes) {
      if (!raspberry.ip) {
        ajouterLog(`OSC ${osc.message} — IP introuvable`, raspberry.raspberryId);
        continue;
      }
      envoyerOscVersRaspberry(
        (ip, raspberryId) => params.envoyerOscPersonnalise(ip, raspberryId, osc.message, osc.value),
        raspberry,
        `[${formaterTempsPiste(evenement.startMs)}] Raspberry ${raspberry.raspberryId} (${raspberry.ip})  ${osc.message} ${osc.value}`.trim(),
        ajouterLog
      );
    }
  };

  boutonLancer.addEventListener("click", () => {
    if (lecture) {
      return;
    }
    synchroniserDepuisPistes(true);
    if (programme.length === 0) {
      ajouterLog("Rien a lancer : aucune region ni marqueur.");
      return;
    }
    for (const evenement of programme) {
      if (!estEvenementMarqueur(evenement)) {
        actualiserCommandeOscEvenement(evenement);
      }
    }
    boutonLancer.disabled = true;
    boutonStop.disabled = false;
    ajouterLog("Lecture demarree.");
    joueur.reinitialiser();
    const compositionEnvoyee = preparerRaspberriesAvantLecture(
      params.listerRaspberriesConnectes(),
      params.envoyerComposition,
      ajouterLog
    );
    if (compositionEnvoyee) {
      ajouterLog(construireTexteLogAttenteComposition(DELAI_APRES_COMPOSITION_MS));
    }
    lecture = lancerLectureSequenceur({
      evenements: programme,
      delaiDemarrageMs: compositionEnvoyee ? DELAI_APRES_COMPOSITION_MS : 0,
      onTick: (timerMs) => {
        const suffixe = lecture?.estEnPauseCue() ? "  (cue)" : "";
        timerAffiche.innerText = `Timer : ${formaterTempsPiste(timerMs)}${suffixe}`;
      },
      onEvenement: (evenement) => {
        if (estEvenementCue(evenement)) {
          bandeauCue.style.display = "block";
          boutonContinuer.style.display = "inline-block";
          ajouterLog(construireTexteLogMarqueur(evenement));
          return;
        }
        if (estEvenementMarqueur(evenement)) {
          envoyerMarqueurOsc(evenement);
          return;
        }
        return joueur.jouer(evenement);
      },
      onFin: () => {
        arreterLecture(false);
        ajouterLog("Lecture terminee.");
      },
    });
  });

  boutonContinuer.addEventListener("click", () => {
    reprendreApresCue();
  });

  boutonStop.addEventListener("click", () => {
    arreterLecture(true);
    ajouterLog("Stop : sons en cours coupés, commandes OSC suivantes annulées.");
  });

  boutonFermer.addEventListener("click", () => {
    arreterLecture(true);
    fermerFenetre();
  });

  actions.appendChild(boutonFermer);
  actions.appendChild(boutonStop);
  actions.appendChild(boutonContinuer);
  actions.appendChild(boutonLancer);
  modal.appendChild(actions);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  window.addEventListener("keydown", onToucheEspace);
  window.addEventListener("raspberry-marqueurs-change", onMarqueursChange);
  synchroniserDepuisPistes(true);
  timerSync = window.setInterval(() => synchroniserDepuisPistes(), INTERVALLE_SYNC_PISTES_MS);
}
