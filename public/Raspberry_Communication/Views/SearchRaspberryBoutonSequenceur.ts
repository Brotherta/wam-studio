const ATTR_BOUTON_SEQUENCEUR = "data-raspberry-sequenceur-osc";

/**
 * Ajoute un bouton Sequenceur a droite du bouton Save.
 */
export function brancherBoutonSequenceurOsc(onClick: () => void): void {
  if (document.querySelector(`[${ATTR_BOUTON_SEQUENCEUR}]`)) {
    return;
  }

  const boutonSave = document.querySelector("[data-raspberry-save-pistes]");
  const boutonLancement = document.getElementById("launch-raspberry-btn");
  const modele =
    boutonSave instanceof HTMLElement
      ? boutonSave
      : boutonLancement instanceof HTMLElement
        ? boutonLancement
        : null;
  if (!modele) {
    return;
  }

  const bouton = modele.cloneNode(true) as HTMLElement;
  bouton.removeAttribute("id");
  bouton.removeAttribute("data-raspberry-save-pistes");
  bouton.setAttribute(ATTR_BOUTON_SEQUENCEUR, "1");
  bouton.style.backgroundColor = "";

  const tooltip = bouton.querySelector(".mytooltip");
  if (tooltip) {
    tooltip.textContent = "Sequenceur OSC";
  }

  const icone = bouton.querySelector("i");
  if (icone) {
    icone.className = "bi bi-clock";
    icone.setAttribute("style", "width: 30px; color: #ffffff;");
  }

  bouton.addEventListener("click", onClick);
  modele.insertAdjacentElement("afterend", bouton);
}
