const ATTR_BOUTON_MARQUEUR = "data-raspberry-marqueur-piste";
const ATTR_BOUTON_SEQUENCEUR = "data-raspberry-sequenceur-osc";

/**
 * Icone drapeau a droite du Sequenceur : pose des marqueurs sur la piste.
 */
export function brancherBoutonMarqueurPiste(onClick: () => void): void {
  if (document.querySelector(`[${ATTR_BOUTON_MARQUEUR}]`)) {
    return;
  }

  const boutonSequenceur = document.querySelector(`[${ATTR_BOUTON_SEQUENCEUR}]`);
  const boutonSave = document.querySelector("[data-raspberry-save-pistes]");
  const modele =
    boutonSequenceur instanceof HTMLElement
      ? boutonSequenceur
      : boutonSave instanceof HTMLElement
        ? boutonSave
        : null;
  if (!modele) {
    return;
  }

  const bouton = modele.cloneNode(true) as HTMLElement;
  bouton.removeAttribute("id");
  bouton.removeAttribute(ATTR_BOUTON_SEQUENCEUR);
  bouton.removeAttribute("data-raspberry-save-pistes");
  bouton.setAttribute(ATTR_BOUTON_MARQUEUR, "1");
  bouton.style.backgroundColor = "";

  const tooltip = bouton.querySelector(".mytooltip");
  if (tooltip) {
    tooltip.textContent = "Marqueur sur la piste";
  }

  const icone = bouton.querySelector("i");
  if (icone) {
    icone.className = "bi bi-flag";
    icone.setAttribute("style", "width: 30px; color: #ffffff;");
  }

  bouton.addEventListener("click", onClick);
  modele.insertAdjacentElement("afterend", bouton);
}

export function afficherEtatBoutonMarqueurPiste(actif: boolean): void {
  const bouton = document.querySelector(`[${ATTR_BOUTON_MARQUEUR}]`);
  if (!(bouton instanceof HTMLElement)) {
    return;
  }
  bouton.style.backgroundColor = actif ? "#c9a227" : "";
  const tooltip = bouton.querySelector(".mytooltip");
  if (tooltip) {
    tooltip.textContent = actif ? "Marqueur : cliquez la piste (Échap pour quitter)" : "Marqueur sur la piste";
  }
  const icone = bouton.querySelector("i");
  if (icone) {
    icone.className = actif ? "bi bi-flag-fill" : "bi bi-flag";
    icone.setAttribute("style", actif ? "width: 30px; color: #1a1a1a;" : "width: 30px; color: #ffffff;");
  }
}
