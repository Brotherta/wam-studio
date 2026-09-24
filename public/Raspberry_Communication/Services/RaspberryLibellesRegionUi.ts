import type { IWamPistesPont } from "../Interfaces/IWamPistesPont";

const ID_CONTENEUR = "raspberry-region-labels";
const ATTR_LIBELLE = "data-raspberry-region-label";

let pontCourant: IWamPistesPont | null = null;
let timerRafraichissement: number | null = null;

function lireConteneur(): HTMLDivElement {
  let conteneur = document.getElementById(ID_CONTENEUR) as HTMLDivElement | null;
  if (conteneur) {
    return conteneur;
  }

  const parent = document.getElementById("editor-canvas");
  conteneur = document.createElement("div");
  conteneur.id = ID_CONTENEUR;
  conteneur.style.position = "absolute";
  conteneur.style.left = "0";
  conteneur.style.top = "0";
  conteneur.style.width = "100%";
  conteneur.style.height = "100%";
  conteneur.style.pointerEvents = "none";
  conteneur.style.overflow = "hidden";
  conteneur.style.zIndex = "5";

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

function cleLibelle(trackId: number, regionId: number): string {
  return `${trackId}-${regionId}`;
}

function creerLibelle(texte: string): HTMLDivElement {
  const libelle = document.createElement("div");
  libelle.setAttribute(ATTR_LIBELLE, "1");
  libelle.textContent = texte;
  libelle.style.position = "absolute";
  libelle.style.top = "4px";
  libelle.style.left = "4px";
  libelle.style.padding = "1px 6px";
  libelle.style.fontSize = "11px";
  libelle.style.fontWeight = "600";
  libelle.style.color = "#ffffff";
  libelle.style.background = "rgba(0, 0, 0, 0.55)";
  libelle.style.borderRadius = "3px";
  libelle.style.whiteSpace = "nowrap";
  libelle.style.maxWidth = "220px";
  libelle.style.overflow = "hidden";
  libelle.style.textOverflow = "ellipsis";
  return libelle;
}

export function rafraichirLibellesRegionUi(pont: IWamPistesPont): void {
  pontCourant = pont;
  const conteneur = lireConteneur();
  const positions = pont.listerPositionsLibellesRegions();
  const utilises = new Set<string>();

  for (const item of positions) {
    if (!item.nomAffiche || item.nomAffiche === "son ?") {
      continue;
    }
    const cle = cleLibelle(item.trackId, item.regionId);
    utilises.add(cle);

    let libelle = conteneur.querySelector<HTMLDivElement>(`[${ATTR_LIBELLE}="${cle}"]`);
    if (!libelle) {
      libelle = creerLibelle(item.nomAffiche);
      libelle.setAttribute(ATTR_LIBELLE, cle);
      conteneur.appendChild(libelle);
    } else {
      libelle.textContent = item.nomAffiche;
    }

    libelle.style.display = item.visible ? "block" : "none";
    libelle.style.transform = `translate(${Math.round(item.x)}px, ${Math.round(item.y)}px)`;
  }

  conteneur.querySelectorAll<HTMLDivElement>(`[${ATTR_LIBELLE}]`).forEach((element) => {
    const cle = element.getAttribute(ATTR_LIBELLE);
    if (cle && !utilises.has(cle)) {
      element.remove();
    }
  });

  demarrerRafraichissementPeriodique();
}

function demarrerRafraichissementPeriodique(): void {
  if (timerRafraichissement !== null) {
    return;
  }
  timerRafraichissement = window.setInterval(() => {
    if (!pontCourant) {
      return;
    }
    rafraichirLibellesRegionUi(pontCourant);
  }, 400);
}
