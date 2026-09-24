const ATTR_BOUTON_SAVE = "data-raspberry-save-pistes";

/**
 * Ajoute un bouton Save a droite du bouton Lancement (meme sauvegarde que F5).
 */
export function brancherBoutonSavePistes(onSave: () => void): void {
  if (document.querySelector(`[${ATTR_BOUTON_SAVE}]`)) {
    return;
  }

  const boutonLancement = document.getElementById("launch-raspberry-btn");
  if (!(boutonLancement instanceof HTMLElement)) {
    return;
  }

  const bouton = boutonLancement.cloneNode(true) as HTMLElement;
  bouton.removeAttribute("id");
  bouton.setAttribute(ATTR_BOUTON_SAVE, "1");
  bouton.style.backgroundColor = "";

  const tooltip = bouton.querySelector(".mytooltip");
  if (tooltip) {
    tooltip.textContent = "Save";
  }

  const icone = bouton.querySelector("i");
  if (icone) {
    icone.className = "bi bi-save";
    icone.setAttribute("style", "width: 30px; color: #ffffff;");
  }

  bouton.addEventListener("click", onSave);
  boutonLancement.insertAdjacentElement("afterend", bouton);
}

export function afficherRetourBoutonSave(ok: boolean): void {
  const bouton = document.querySelector(`[${ATTR_BOUTON_SAVE}]`);
  if (!(bouton instanceof HTMLElement)) {
    return;
  }
  const tooltip = bouton.querySelector(".mytooltip");
  const couleurOriginale = bouton.style.backgroundColor;
  bouton.style.backgroundColor = ok ? "#1f8b4c" : "#a53333";
  if (tooltip) {
    tooltip.textContent = ok ? "Enregistre" : "Echec";
  }
  window.setTimeout(() => {
    bouton.style.backgroundColor = couleurOriginale;
    if (tooltip) {
      tooltip.textContent = "Save";
    }
  }, 1600);
}
