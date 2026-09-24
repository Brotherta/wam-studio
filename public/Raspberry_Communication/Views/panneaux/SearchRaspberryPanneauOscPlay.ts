import Raspberry from "../../Models/Raspberry";
import type { OscDraft } from "../../Models/SearchRaspberryState";
import {
  construireOscPlayDraftDepuisFichier,
  construireArgumentsPlay,
  estFichierSonAffichable,
  estFichierSonJouable,
  formaterLibelleFichierPlay,
  lireNiveauPlay,
  OSC_PLAY_NIVEAU_DEFAUT,
  texteStatutFichiersPlay,
} from "../../utils/osc/OscPlayHelpers";
import { synchroniserLibellesDepuisFichiers } from "../../Services/RaspberryLibellesSonsStore";
import { afficherLigneGrilleOsc, creerLigneGrilleOsc } from "./SearchRaspberryPanneauOscDom";

const cacheFichiersSon = new Map<string, string[]>();

export function invaliderCacheFichiersSonPi(ip?: string): void {
  if (ip) {
    cacheFichiersSon.delete(ip);
    return;
  }
  cacheFichiersSon.clear();
}

export type HoteListeFichiersPlay = {
  listerFichiersSonSurPi?: (
    ip: string
  ) => Promise<
    | { ok: true; fichiers: string[]; remoteDirectory: string }
    | { ok: false; error: string }
  >;
};

export type ControleChampsPlayOsc = {
  afficher: (visible: boolean) => void;
  chargerListe: () => Promise<void>;
  synchroniserArguments: (argsInput: HTMLInputElement) => void;
  lireEtat: () => Pick<OscDraft, "playFichier" | "playSonNumber" | "playLevel">;
};

export function ajouterChampsPlayAuFormulaire(
  form: HTMLElement,
  raspberry: Raspberry,
  hote: HoteListeFichiersPlay,
  draft: OscDraft | undefined,
  argsInput: HTMLInputElement
): ControleChampsPlayOsc {
  const fichierSelect = document.createElement("select");
  fichierSelect.style.width = "100%";
  fichierSelect.disabled = true;

  const niveauInput = document.createElement("input");
  niveauInput.type = "number";
  niveauInput.min = "0";
  niveauInput.max = "127";
  niveauInput.value = String(draft?.playLevel ?? OSC_PLAY_NIVEAU_DEFAUT);
  niveauInput.style.width = "100%";

  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.className = "btn btn-sm btn-secondary";
  refreshBtn.innerText = "Actualiser la liste";
  refreshBtn.disabled = !raspberry.isOnline || !hote.listerFichiersSonSurPi;

  const listeStatut = document.createElement("div");
  listeStatut.style.gridColumn = "1 / -1";
  listeStatut.style.fontSize = "11px";
  listeStatut.style.opacity = "0.85";

  const ligneFichier = creerLigneGrilleOsc("Fichier", fichierSelect);
  const ligneNiveau = creerLigneGrilleOsc("Niveau", niveauInput);
  const ligneActualiser = creerLigneGrilleOsc("", refreshBtn);
  const ligneStatut = document.createElement("div");
  ligneStatut.style.display = "contents";
  ligneStatut.appendChild(listeStatut);

  form.appendChild(ligneFichier);
  form.appendChild(ligneNiveau);
  form.appendChild(ligneActualiser);
  form.appendChild(ligneStatut);

  const lignes = [ligneFichier, ligneNiveau, ligneActualiser, ligneStatut];
  let fichiersDisponibles: string[] = [];
  let visible = false;
  let chargementEnCours = false;

  for (const ligne of lignes) {
    afficherLigneGrilleOsc(ligne, false);
  }

  const remplirListeFichiers = (fichiers: string[]) => {
    fichiersDisponibles = fichiers;
    const libelles = synchroniserLibellesDepuisFichiers(raspberry.ip, fichiers);
    const visibles = fichiers.filter(estFichierSonAffichable);
    const jouables = visibles.filter(estFichierSonJouable);
    const selectionPrecedente = fichierSelect.value;
    fichierSelect.innerHTML = "";

    if (visibles.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.text = "Aucun fichier audio dans sons/";
      fichierSelect.appendChild(option);
      fichierSelect.disabled = true;
      return;
    }

    const selection =
      (selectionPrecedente && jouables.includes(selectionPrecedente)
        ? selectionPrecedente
        : undefined) ||
      (draft?.playFichier && jouables.includes(draft.playFichier)
        ? draft.playFichier
        : jouables[0]);

    for (const nom of visibles) {
      const option = document.createElement("option");
      option.value = nom;
      option.text = formaterLibelleFichierPlay(nom, libelles);
      option.disabled = !estFichierSonJouable(nom);
      fichierSelect.appendChild(option);
    }
    if (selection) {
      fichierSelect.value = selection;
    }
    fichierSelect.disabled = !raspberry.isOnline || jouables.length === 0;
    synchroniserArguments(argsInput);
  };

  const lireDraftCourant = () => {
    return construireOscPlayDraftDepuisFichier(
      fichierSelect.value,
      lireNiveauPlay(niveauInput.value)
    );
  };

  const synchroniserArguments = (cible: HTMLInputElement) => {
    const playDraft = lireDraftCourant();
    if (playDraft) {
      cible.value = construireArgumentsPlay(playDraft);
    }
  };

  const chargerListe = async () => {
    if (!visible || chargementEnCours) {
      return;
    }
    if (!hote.listerFichiersSonSurPi) {
      listeStatut.innerText = "Liste distante indisponible.";
      return;
    }
    if (!raspberry.isOnline) {
      listeStatut.innerText = "Raspberry hors ligne.";
      return;
    }

    const fichiersEnCache = cacheFichiersSon.get(raspberry.ip);
    if (fichiersEnCache) {
      remplirListeFichiers(fichiersEnCache);
      listeStatut.innerText = texteStatutFichiersPlay(fichiersEnCache);
    } else {
      listeStatut.innerText = "Chargement des fichiers sur le Pi...";
    }

    chargementEnCours = true;
    refreshBtn.disabled = true;
    const resultat = await hote.listerFichiersSonSurPi(raspberry.ip);
    chargementEnCours = false;
    refreshBtn.disabled = !raspberry.isOnline;
    if (!resultat.ok) {
      if (!fichiersEnCache) {
        listeStatut.innerText = resultat.error;
        remplirListeFichiers([]);
      }
      return;
    }

    cacheFichiersSon.set(raspberry.ip, resultat.fichiers);
    remplirListeFichiers(resultat.fichiers);
    listeStatut.innerText = texteStatutFichiersPlay(fichiersDisponibles);
  };

  fichierSelect.addEventListener("change", () => {
    synchroniserArguments(argsInput);
  });
  niveauInput.addEventListener("input", () => {
    synchroniserArguments(argsInput);
  });
  refreshBtn.addEventListener("click", () => {
    cacheFichiersSon.delete(raspberry.ip);
    void chargerListe();
  });

  return {
    afficher: (prochainVisible) => {
      const vientDApparaitre = prochainVisible && !visible;
      visible = prochainVisible;
      for (const ligne of lignes) {
        afficherLigneGrilleOsc(ligne, prochainVisible);
      }
      if (vientDApparaitre) {
        void chargerListe();
      }
    },
    chargerListe,
    synchroniserArguments,
    lireEtat: () => {
      const playDraft = lireDraftCourant();
      return {
        playFichier: fichierSelect.value || undefined,
        playSonNumber: playDraft?.sonNumber,
        playLevel: lireNiveauPlay(niveauInput.value),
      };
    },
  };
}
