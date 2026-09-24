import type { MarqueurSequenceur } from "../Models/MarqueurSequenceur";
import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";
import { lireMarqueursSequenceur } from "./RaspberryMarqueursStore";
import { lireCueEnAttente } from "./RaspberryMarqueursCueEtat";
import { texteEtiquetteMarqueur } from "../utils/osc/CommandesOscMarqueur";

export const ID_CONTENEUR_MARQUEURS_PISTE = "raspberry-marqueurs-piste";
export const ATTR_MARQUEUR_PISTE = "data-raspberry-marqueur";

let pontCourant: IWamPistesPont | null = null;
let timerRafraichissement: number | null = null;
let modePlacement = false;
let idMarqueurEdite: string | null = null;
let onClicMarqueur: ((id: string, event: MouseEvent) => void) | null = null;

function appliquerStyleConteneur(conteneur: HTMLDivElement): void {
  conteneur.style.position = "absolute";
  conteneur.style.left = "0";
  conteneur.style.top = "0";
  conteneur.style.width = "100%";
  conteneur.style.height = "100%";
  conteneur.style.overflow = "hidden";
  conteneur.style.zIndex = "6";
  conteneur.style.pointerEvents = modePlacement ? "auto" : "none";
  conteneur.style.cursor = modePlacement ? "crosshair" : "default";
}

export function lireConteneurMarqueursPiste(): HTMLDivElement {
  let conteneur = document.getElementById(ID_CONTENEUR_MARQUEURS_PISTE) as HTMLDivElement | null;
  if (conteneur) {
    appliquerStyleConteneur(conteneur);
    return conteneur;
  }

  const parent = document.getElementById("editor-canvas");
  conteneur = document.createElement("div");
  conteneur.id = ID_CONTENEUR_MARQUEURS_PISTE;
  appliquerStyleConteneur(conteneur);

  if (parent) {
    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }
    parent.appendChild(conteneur);
  } else {
    document.body.appendChild(conteneur);
  }

  return conteneur;
}

export function appliquerModePlacementMarqueursPiste(actif: boolean): void {
  modePlacement = actif;
  const conteneur = document.getElementById(ID_CONTENEUR_MARQUEURS_PISTE) as HTMLDivElement | null;
  if (conteneur) {
    appliquerStyleConteneur(conteneur);
  }
}

export function definirGestionClicMarqueur(
  handler: ((id: string, event: MouseEvent) => void) | null
): void {
  onClicMarqueur = handler;
}

export function definirIdMarqueurEdite(id: string | null): void {
  idMarqueurEdite = id;
}

function couleurMarqueur(type: MarqueurSequenceur["type"]): string {
  return type === "cue" ? "#fdd835" : "#ff9800";
}

function creerDrapeau(marqueur: MarqueurSequenceur): HTMLDivElement {
  const drapeau = document.createElement("div");
  drapeau.setAttribute(ATTR_MARQUEUR_PISTE, marqueur.id);
  drapeau.title = texteEtiquetteMarqueur(marqueur) + " — cliquer pour modifier";
  drapeau.style.position = "absolute";
  drapeau.style.left = "0";
  drapeau.style.top = "0";
  drapeau.style.width = "14px";
  drapeau.style.marginLeft = "-6px";
  drapeau.style.background = "transparent";
  drapeau.style.pointerEvents = "auto";
  drapeau.style.cursor = "pointer";
  drapeau.addEventListener("click", (event) => {
    onClicMarqueur?.(marqueur.id, event);
  });

  const trait = document.createElement("div");
  trait.style.position = "absolute";
  trait.style.left = "6px";
  trait.style.top = "0";
  trait.style.width = "2px";
  trait.style.height = "100%";
  trait.style.background = couleurMarqueur(marqueur.type);
  trait.style.boxShadow = "0 0 0 1px rgba(0, 0, 0, 0.35)";
  drapeau.appendChild(trait);

  const etiquette = document.createElement("div");
  etiquette.textContent = texteEtiquetteMarqueur(marqueur);
  etiquette.style.position = "absolute";
  etiquette.style.left = "10px";
  etiquette.style.top = "0";
  etiquette.style.padding = "1px 6px";
  etiquette.style.fontSize = "10px";
  etiquette.style.fontWeight = "700";
  etiquette.style.color = "#1a1a1a";
  etiquette.style.background = couleurMarqueur(marqueur.type);
  etiquette.style.borderRadius = "3px";
  etiquette.style.whiteSpace = "nowrap";
  etiquette.style.maxWidth = "140px";
  etiquette.style.overflow = "hidden";
  etiquette.style.textOverflow = "ellipsis";
  drapeau.appendChild(etiquette);
  return drapeau;
}

export function rafraichirMarqueursPisteUi(pont: IWamPistesPont): void {
  pontCourant = pont;
  const conteneur = lireConteneurMarqueursPiste();
  const utilises = new Set<string>();

  for (const marqueur of lireMarqueursSequenceur()) {
    const position = pont.lirePositionMarqueurPiste(marqueur.tempsMs);
    utilises.add(marqueur.id);

    let drapeau = conteneur.querySelector<HTMLDivElement>(
      `[${ATTR_MARQUEUR_PISTE}="${marqueur.id}"]`
    );
    if (!drapeau) {
      drapeau = creerDrapeau(marqueur);
      conteneur.appendChild(drapeau);
    } else {
      const etiquette = drapeau.lastElementChild;
      if (etiquette) {
        etiquette.textContent = texteEtiquetteMarqueur(marqueur);
      }
      const trait = drapeau.firstElementChild as HTMLElement | null;
      if (trait) {
        trait.style.background = couleurMarqueur(marqueur.type);
      }
      drapeau.title = texteEtiquetteMarqueur(marqueur) + " — cliquer pour modifier";
    }

    drapeau.style.display = position.visible ? "block" : "none";
    drapeau.style.pointerEvents = "auto";
    drapeau.style.cursor = "pointer";
    drapeau.style.height = `${Math.max(24, Math.round(position.hauteur))}px`;
    drapeau.style.transform = `translate(${Math.round(position.x)}px, ${Math.round(position.y)}px)`;
    const enAttente = lireCueEnAttente()?.id === marqueur.id;
    const enEdition = idMarqueurEdite === marqueur.id;
    drapeau.style.filter = enAttente || enEdition ? "brightness(1.2)" : "";
    drapeau.style.outline = enEdition
      ? "2px solid #ffffff"
      : enAttente
        ? "2px solid #fff176"
        : "none";
  }

  conteneur.querySelectorAll<HTMLDivElement>(`[${ATTR_MARQUEUR_PISTE}]`).forEach((element) => {
    const id = element.getAttribute(ATTR_MARQUEUR_PISTE);
    if (id && !utilises.has(id)) {
      element.remove();
    }
  });

  demarrerRafraichissementPeriodique();
  actualiserBandeauCuePiste();
}

const ID_BANDEAU_CUE = "raspberry-bandeau-cue-attente";

export function actualiserBandeauCuePiste(): void {
  const parent = document.getElementById("editor-canvas") ?? document.body;
  let bandeau = document.getElementById(ID_BANDEAU_CUE) as HTMLDivElement | null;
  const attente = lireCueEnAttente();
  if (!attente) {
    bandeau?.remove();
    return;
  }
  if (!bandeau) {
    bandeau = document.createElement("div");
    bandeau.id = ID_BANDEAU_CUE;
    bandeau.style.position = "absolute";
    bandeau.style.left = "50%";
    bandeau.style.bottom = "12px";
    bandeau.style.transform = "translateX(-50%)";
    bandeau.style.padding = "8px 14px";
    bandeau.style.borderRadius = "6px";
    bandeau.style.background = "rgba(253, 216, 53, 0.92)";
    bandeau.style.color = "#1a1a1a";
    bandeau.style.fontSize = "13px";
    bandeau.style.fontWeight = "700";
    bandeau.style.zIndex = "9";
    bandeau.style.pointerEvents = "none";
    bandeau.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.35)";
    parent.appendChild(bandeau);
  }
  bandeau.textContent = "Cue : lecture en pause — Espace pour continuer";
}

export function demarrerAffichageMarqueursPiste(pont: IWamPistesPont): void {
  rafraichirMarqueursPisteUi(pont);
}

function demarrerRafraichissementPeriodique(): void {
  if (timerRafraichissement !== null) {
    return;
  }
  timerRafraichissement = window.setInterval(() => {
    if (!pontCourant) {
      return;
    }
    rafraichirMarqueursPisteUi(pontCourant);
  }, 400);
}
