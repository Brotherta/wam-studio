import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import type { MarqueurSequenceur } from "../Models/MarqueurSequenceur";
import {
  ajouterMarqueurSequenceur,
  creerIdMarqueur,
  mettreAJourMarqueurSequenceur,
  supprimerMarqueurSequenceur,
  trouverMarqueurParId,
} from "./RaspberryMarqueursStore";
import { parserAdresseOscPersonnalisee } from "./RaspberryMarqueursSequenceur";
import {
  ATTR_MARQUEUR_PISTE,
  appliquerModePlacementMarqueursPiste,
  definirGestionClicMarqueur,
  definirIdMarqueurEdite,
  lireConteneurMarqueursPiste,
  rafraichirMarqueursPisteUi,
} from "./RaspberryMarqueursPisteUi";
import { afficherEtatBoutonMarqueurPiste } from "../Views/SearchRaspberryBoutonMarqueur";
import { creerBarrePlacementMarqueurs } from "../Views/sequenceur/SearchRaspberryBarrePlacementMarqueurs";
import { formaterTempsPiste } from "../utils/osc/FormatTempsPiste";
import { texteEtiquetteMarqueur } from "../utils/osc/CommandesOscMarqueur";

let pontCourant: IWamPistesPont | null = null;
let actif = false;
let barre: ReturnType<typeof creerBarrePlacementMarqueurs> | null = null;
let ligneApercu: HTMLDivElement | null = null;

function rafraichir(): void {
  if (pontCourant) {
    rafraichirMarqueursPisteUi(pontCourant);
  }
}

function lireOscDepuisBarre(): { adresse: string; valeur: string } | null {
  if (!barre) {
    return null;
  }
  const options = barre.lireOptions();
  if (options.type !== "osc") {
    return { adresse: "", valeur: "" };
  }
  const osc = parserAdresseOscPersonnalisee(options.oscAdresse, options.oscValeur);
  if (!osc) {
    barre.afficherMessage("Adresse OSC invalide. Exemple : /level");
    return null;
  }
  return { adresse: osc.message, valeur: osc.value };
}

function ouvrirEditionMarqueur(id: string): void {
  if (!pontCourant) {
    return;
  }
  if (!actif) {
    activerPlacementMarqueursPiste(pontCourant);
  }
  const marqueur = trouverMarqueurParId(id);
  if (!marqueur || !barre) {
    return;
  }
  definirIdMarqueurEdite(id);
  barre.chargerMarqueur(marqueur);
  barre.afficherMessage(
    `Modification de ${texteEtiquetteMarqueur(marqueur)} uniquement. Enregistrer pour valider.`
  );
  rafraichir();
}

function enregistrerEditionMarqueur(): void {
  if (!barre || !pontCourant) {
    return;
  }
  const id = barre.lireIdEdition();
  if (!id) {
    return;
  }
  const options = barre.lireOptions();
  const osc = lireOscDepuisBarre();
  if (osc === null) {
    return;
  }
  mettreAJourMarqueurSequenceur(id, {
    type: options.type,
    libelle: options.libelle,
    oscAdresse: osc.adresse,
    oscValeur: osc.valeur,
  });
  const misAJour = trouverMarqueurParId(id);
  barre.afficherMessage(
    `${texteEtiquetteMarqueur(misAJour ?? { type: options.type, libelle: options.libelle, oscAdresse: osc.adresse, oscValeur: osc.valeur })} enregistré.`
  );
  barre.quitterEdition();
  definirIdMarqueurEdite(null);
  rafraichir();
}

function supprimerEditionMarqueur(): void {
  if (!barre) {
    return;
  }
  const id = barre.lireIdEdition();
  if (!id) {
    return;
  }
  supprimerMarqueurSequenceur(id);
  barre.quitterEdition();
  definirIdMarqueurEdite(null);
  barre.afficherMessage("Marqueur supprimé.");
  rafraichir();
}

function onToucheEchap(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    if (barre?.lireIdEdition()) {
      barre.quitterEdition();
      definirIdMarqueurEdite(null);
      barre.afficherMessage("Création d'un nouveau marqueur. Cliquez la piste.");
      rafraichir();
      return;
    }
    desactiverPlacementMarqueursPiste();
  }
}

function poserMarqueurAuClic(event: MouseEvent): void {
  if (!pontCourant || !barre) {
    return;
  }
  const cible = event.target as HTMLElement | null;
  if (cible?.closest("#raspberry-barre-placement-marqueurs")) {
    return;
  }
  if (cible?.closest(`[${ATTR_MARQUEUR_PISTE}]`)) {
    return;
  }

  if (barre.lireIdEdition()) {
    barre.quitterEdition();
    definirIdMarqueurEdite(null);
  }

  const conteneur = lireConteneurMarqueursPiste();
  const rect = conteneur.getBoundingClientRect();
  const xCanvas = event.clientX - rect.left;
  const tempsMs = pontCourant.lireTempsMsDepuisXCanvas(xCanvas);
  const options = barre.lireOptions();
  const osc = lireOscDepuisBarre();
  if (osc === null) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const nouveau: MarqueurSequenceur = {
    id: creerIdMarqueur(),
    type: options.type,
    tempsMs,
    libelle: options.libelle,
    oscAdresse: osc.adresse,
    oscValeur: osc.valeur,
  };
  ajouterMarqueurSequenceur(nouveau);
  rafraichir();
  barre.afficherMessage(
    `${texteEtiquetteMarqueur(nouveau)} posé à ${formaterTempsPiste(tempsMs)}. Cliquez pour un autre, ou un drapeau pour modifier.`
  );
  event.preventDefault();
  event.stopPropagation();
}

function suivreApercu(event: MouseEvent): void {
  if (!ligneApercu) {
    return;
  }
  const conteneur = lireConteneurMarqueursPiste();
  const rect = conteneur.getBoundingClientRect();
  const x = Math.max(0, event.clientX - rect.left);
  ligneApercu.style.display = "block";
  ligneApercu.style.transform = `translateX(${Math.round(x)}px)`;
}

function bloquerInteractionPiste(event: Event): void {
  const cible = event.target as HTMLElement | null;
  if (cible?.closest("#raspberry-barre-placement-marqueurs")) {
    return;
  }
  event.stopPropagation();
}

export function estPlacementMarqueursActif(): boolean {
  return actif;
}

export function brancherEditionMarqueursPiste(pont: IWamPistesPont): void {
  pontCourant = pont;
  definirGestionClicMarqueur((id, event) => {
    event.preventDefault();
    event.stopPropagation();
    ouvrirEditionMarqueur(id);
  });
}

export function desactiverPlacementMarqueursPiste(): void {
  if (!actif) {
    return;
  }
  actif = false;
  const conteneur = document.getElementById("raspberry-marqueurs-piste");
  if (conteneur) {
    conteneur.removeEventListener("click", poserMarqueurAuClic, true);
    conteneur.removeEventListener("mousedown", bloquerInteractionPiste, true);
    conteneur.removeEventListener("mousemove", suivreApercu);
  }
  window.removeEventListener("keydown", onToucheEchap);
  barre?.detruire();
  barre = null;
  ligneApercu?.remove();
  ligneApercu = null;
  definirIdMarqueurEdite(null);
  appliquerModePlacementMarqueursPiste(false);
  afficherEtatBoutonMarqueurPiste(false);
}

export function activerPlacementMarqueursPiste(pont: IWamPistesPont): void {
  if (actif) {
    return;
  }
  pontCourant = pont;
  actif = true;
  brancherEditionMarqueursPiste(pont);
  afficherEtatBoutonMarqueurPiste(true);
  appliquerModePlacementMarqueursPiste(true);
  rafraichirMarqueursPisteUi(pont);

  const conteneur = lireConteneurMarqueursPiste();
  barre = creerBarrePlacementMarqueurs({
    onQuitter: () => desactiverPlacementMarqueursPiste(),
    onEnregistrerEdition: () => enregistrerEditionMarqueur(),
    onSupprimerEdition: () => supprimerEditionMarqueur(),
  });
  conteneur.appendChild(barre.element);

  ligneApercu = document.createElement("div");
  ligneApercu.style.position = "absolute";
  ligneApercu.style.top = "0";
  ligneApercu.style.left = "0";
  ligneApercu.style.width = "2px";
  ligneApercu.style.height = "100%";
  ligneApercu.style.background = "rgba(253, 216, 53, 0.85)";
  ligneApercu.style.pointerEvents = "none";
  ligneApercu.style.display = "none";
  conteneur.appendChild(ligneApercu);

  conteneur.addEventListener("click", poserMarqueurAuClic, true);
  conteneur.addEventListener("mousedown", bloquerInteractionPiste, true);
  conteneur.addEventListener("mousemove", suivreApercu);
  window.addEventListener("keydown", onToucheEchap);
}

export function basculerPlacementMarqueursPiste(pont: IWamPistesPont): void {
  if (actif) {
    desactiverPlacementMarqueursPiste();
    return;
  }
  activerPlacementMarqueursPiste(pont);
}
