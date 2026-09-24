import type {
  CibleEnvoiAudio,
  ResultatEnvoiUnitaire,
  SelectionEnvoiAudio,
} from "../Services/RaspberryEnvoiAudioLotService";
import { sanitiserNomSon } from "../utils/agent-transfert/AgentTransfertHelpers";
import { demanderConfirmation } from "./SearchRaspberryConfirmationEnvoi";
import {
  construireLigneEnvoiAudio,
  lireOptionsDepuisLigne,
  type LigneEnvoiAudioDom,
} from "./SearchRaspberryLigneEnvoiAudio";

const ID_OVERLAY = "raspberry-send-audio-overlay";

export type ProgressionEnvoiUi = {
  nomAffichage: string;
  texte: string;
  uploadPercent: number;
  scpPercent: number;
  uploadLibelle?: string;
  scpLibelle?: string;
  indexCourant: number;
  total: number;
  indexFichier?: number;
  totalFichiers?: number;
  nomFichier?: string;
};

export type ControleFenetreEnvoiAudio = {
  afficherProgression: (progression: ProgressionEnvoiUi) => void;
};

function appliquerStyleOverlay(overlay: HTMLDivElement): void {
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0, 0, 0, 0.45)";
  overlay.style.zIndex = "2000";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
}

function appliquerStyleModal(modal: HTMLDivElement): void {
  modal.style.background = "#1f252b";
  modal.style.color = "#f1f1f1";
  modal.style.padding = "20px";
  modal.style.border = "1px solid #3b4046";
  modal.style.borderRadius = "8px";
  modal.style.width = "460px";
  modal.style.maxHeight = "80vh";
  modal.style.overflow = "auto";
}

function formaterDureeEnvoi(secondes: number): string {
  const total = Math.max(0, Math.floor(secondes));
  const minutes = Math.floor(total / 60);
  const reste = total % 60;
  if (minutes === 0) {
    return `${reste} s`;
  }
  return `${minutes} min ${reste.toString().padStart(2, "0")} s`;
}

function lireSelectionsCochees(
  lignes: LigneEnvoiAudioDom[]
): { ok: true; selections: SelectionEnvoiAudio[] } | { ok: false; erreur: string } {
  const selections: SelectionEnvoiAudio[] = [];
  for (const ligne of lignes) {
    if (!ligne.caseEnvoi.checked || ligne.caseEnvoi.disabled) {
      continue;
    }
    const options = lireOptionsDepuisLigne(ligne);
    selections.push({ ip: ligne.ip, options });
  }
  if (selections.length === 0) {
    return {
      ok: false,
      erreur: "Cochez au moins un Raspberry en ligne avec une piste.",
    };
  }
  return { ok: true, selections };
}

function compterSonsNonNommes(selections: SelectionEnvoiAudio[]): number {
  let total = 0;
  for (const selection of selections) {
    if (!selection.options.renommage) {
      continue;
    }
    for (const nom of selection.options.nomsSons) {
      if (!sanitiserNomSon(nom)) {
        total += 1;
      }
    }
  }
  return total;
}

async function confirmerEnvoiSiBesoin(selections: SelectionEnvoiAudio[]): Promise<boolean> {
  const manquants = compterSonsNonNommes(selections);
  if (manquants > 0) {
    const libelle = manquants > 1 ? "sons non nommés" : "son non nommé";
    return demanderConfirmation(
      "Sons non nommés",
      `Il y a ${manquants} ${libelle}. Vous êtes sûr de vouloir continuer ?`,
      "Continuer",
      "Annuler"
    );
  }
  const sansRenommage = selections.some((selection) => !selection.options.renommage);
  if (!sansRenommage) {
    return true;
  }
  return demanderConfirmation(
    "Envoi sans renommage",
    "Êtes-vous sûr de vouloir envoyer les fichiers sons sans les renommer ? Ils seront nommés automatiquement (son500.wav, son501.wav, ...).",
    "Envoyer sans renommer",
    "Annuler"
  );
}

function creerBarre(libelle: string, attribut: string): { bloc: HTMLDivElement; barre: HTMLProgressElement } {
  const bloc = document.createElement("div");
  bloc.style.marginTop = "8px";
  const titre = document.createElement("div");
  titre.style.fontSize = "11px";
  titre.style.opacity = "0.85";
  titre.setAttribute(attribut.replace("barre", "detail"), "1");
  titre.innerText = `${libelle} : 0%`;
  const barre = document.createElement("progress");
  barre.max = 100;
  barre.value = 0;
  barre.style.width = "100%";
  barre.setAttribute(attribut, "1");
  bloc.appendChild(titre);
  bloc.appendChild(barre);
  return { bloc, barre };
}

function appliquerEtatBoutonEnvoyer(bouton: HTMLButtonElement, enCours: boolean): void {
  bouton.disabled = enCours;
  bouton.innerText = enCours ? "Envoi en cours..." : "Envoyer";
  bouton.style.background = enCours ? "#3b4046" : "#2e7d32";
  bouton.style.cursor = enCours ? "not-allowed" : "pointer";
  bouton.style.opacity = enCours ? "0.85" : "1";
}

function fermerOverlay(): void {
  document.getElementById(ID_OVERLAY)?.remove();
}

/**
 * Fenetre de selection des Raspberry pour envoyer les pistes WAV liees.
 */
export function ouvrirFenetreEnvoiAudio(params: {
  cibles: CibleEnvoiAudio[];
  onEnvoyer: (
    selections: SelectionEnvoiAudio[],
    controle: ControleFenetreEnvoiAudio
  ) => Promise<ResultatEnvoiUnitaire[]>;
  onAnnuler?: () => void;
}): void {
  fermerOverlay();

  const overlay = document.createElement("div");
  overlay.id = ID_OVERLAY;
  appliquerStyleOverlay(overlay);

  const modal = document.createElement("div");
  appliquerStyleModal(modal);

  const titre = document.createElement("h3");
  titre.style.margin = "0 0 8px";
  titre.innerText = "Send Audio";
  modal.appendChild(titre);

  const hint = document.createElement("div");
  hint.style.fontSize = "12px";
  hint.style.opacity = "0.8";
  hint.style.marginBottom = "14px";
  hint.innerText =
    "Cochez les Raspberry. Découpage : chaque coupure devient un fichier. Renommage : le nom s'affiche dans la liste de lecture (ex. daylight). Sur le Pi, le fichier reste son500.wav, car Skini ne joue que /play {numero}.";
  modal.appendChild(hint);

  const liste = document.createElement("div");
  const lignes: LigneEnvoiAudioDom[] = [];
  if (params.cibles.length === 0) {
    const vide = document.createElement("div");
    vide.innerText = "Aucun Raspberry connu pour l'instant.";
    liste.appendChild(vide);
  } else {
    for (const cible of params.cibles) {
      const ligne = construireLigneEnvoiAudio(cible);
      lignes.push(ligne);
      liste.appendChild(ligne.bloc);
    }
  }
  modal.appendChild(liste);

  const statut = document.createElement("div");
  statut.style.fontSize = "12px";
  statut.style.margin = "12px 0 4px";
  statut.style.minHeight = "18px";
  statut.style.whiteSpace = "pre-wrap";
  modal.appendChild(statut);

  const chrono = document.createElement("div");
  chrono.style.fontSize = "11px";
  chrono.style.opacity = "0.8";
  chrono.style.marginBottom = "4px";
  chrono.hidden = true;
  modal.appendChild(chrono);

  const upload = creerBarre("Upload (vers l'agent)", "data-envoi-barre-upload");
  const scp = creerBarre("Envoi vers le Raspberry", "data-envoi-barre-scp");
  upload.bloc.hidden = true;
  scp.bloc.hidden = true;
  modal.appendChild(upload.bloc);
  modal.appendChild(scp.bloc);

  const detailUpload = upload.bloc.querySelector("div") as HTMLDivElement;
  const detailScp = scp.bloc.querySelector("div") as HTMLDivElement;

  let timerChrono: number | null = null;
  const arreterChrono = (): void => {
    if (timerChrono !== null) {
      window.clearInterval(timerChrono);
      timerChrono = null;
    }
  };
  const demarrerChrono = (): void => {
    arreterChrono();
    const debut = Date.now();
    chrono.hidden = false;
    const rafraichir = () => {
      chrono.innerText = `Temps écoulé : ${formaterDureeEnvoi((Date.now() - debut) / 1000)}`;
    };
    rafraichir();
    timerChrono = window.setInterval(rafraichir, 1000);
  };

  const controle: ControleFenetreEnvoiAudio = {
    afficherProgression: (progression) => {
      upload.bloc.hidden = false;
      scp.bloc.hidden = false;
      const fichier =
        progression.nomFichier && progression.totalFichiers
          ? `Fichier ${progression.indexFichier ?? 1}/${progression.totalFichiers} : ${progression.nomFichier}`
          : "";
      statut.innerText = [
        `${progression.nomAffichage} (Raspberry ${progression.indexCourant}/${progression.total})`,
        fichier,
        progression.texte,
      ]
        .filter(Boolean)
        .join("\n");
      upload.barre.value = progression.uploadPercent;
      scp.barre.value = progression.scpPercent;
      detailUpload.innerText =
        progression.uploadLibelle || `Upload : ${Math.round(progression.uploadPercent)}%`;
      const scpParDefaut =
        progression.scpPercent <= 0 && progression.uploadPercent >= 100
          ? "Envoi vers le Raspberry : connexion SSH en cours..."
          : `Envoi vers le Raspberry : ${Math.round(progression.scpPercent)}%`;
      detailScp.innerText = progression.scpLibelle || scpParDefaut;
    },
  };

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.justifyContent = "flex-end";
  actions.style.gap = "8px";
  actions.style.marginTop = "14px";

  const boutonFermer = document.createElement("button");
  boutonFermer.type = "button";
  boutonFermer.innerText = "Fermer";
  boutonFermer.addEventListener("click", () => {
    arreterChrono();
    fermerOverlay();
  });

  const boutonAnnuler = document.createElement("button");
  boutonAnnuler.type = "button";
  boutonAnnuler.innerText = "Annuler";
  boutonAnnuler.hidden = true;
  boutonAnnuler.addEventListener("click", () => {
    params.onAnnuler?.();
    statut.innerText = "Annulation demandée...";
  });

  const boutonEnvoyer = document.createElement("button");
  boutonEnvoyer.type = "button";
  boutonEnvoyer.style.color = "#fff";
  boutonEnvoyer.style.border = "none";
  boutonEnvoyer.style.padding = "6px 12px";
  boutonEnvoyer.style.borderRadius = "4px";
  appliquerEtatBoutonEnvoyer(boutonEnvoyer, false);
  boutonEnvoyer.addEventListener("click", async () => {
    const lecture = lireSelectionsCochees(lignes);
    if (!lecture.ok) {
      statut.innerText = lecture.erreur;
      return;
    }
    const accepte = await confirmerEnvoiSiBesoin(lecture.selections);
    if (!accepte) {
      return;
    }
    appliquerEtatBoutonEnvoyer(boutonEnvoyer, true);
    boutonFermer.disabled = true;
    boutonAnnuler.hidden = false;
    upload.bloc.hidden = false;
    scp.bloc.hidden = false;
    statut.innerText = `Préparation de l'envoi vers ${lecture.selections.length} Raspberry...`;
    demarrerChrono();
    const resultats = await params.onEnvoyer(lecture.selections, controle);
    arreterChrono();
    statut.innerText = resultats
      .map((item) => `${item.nomAffichage} : ${item.ok ? "OK — " + item.message : item.message}`)
      .join("\n");
    boutonFermer.disabled = false;
    boutonAnnuler.hidden = true;
    appliquerEtatBoutonEnvoyer(boutonEnvoyer, false);
  });

  actions.appendChild(boutonFermer);
  actions.appendChild(boutonAnnuler);
  actions.appendChild(boutonEnvoyer);
  modal.appendChild(actions);

  overlay.appendChild(modal);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay && !boutonEnvoyer.disabled) {
      arreterChrono();
      fermerOverlay();
    }
  });
  document.body.appendChild(overlay);
}
