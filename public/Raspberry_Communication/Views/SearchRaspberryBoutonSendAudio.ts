const ATTR_BOUTON_SEND_AUDIO = "data-raspberry-send-audio";
const ATTR_BOUTON_DELETE_AUDIO = "data-raspberry-delete-audio";
const ATTR_BOUTON_IMPORT_AUDIO = "data-raspberry-import-audio";
const ATTR_CONTENEUR_BOUTONS = "data-raspberry-audio-buttons";

function texteBouton(element: Element): string {
  return element.querySelector(".new-track-text")?.textContent?.trim() ?? "";
}

function trouverBoutonAddRaspberryPi(): HTMLElement | null {
  const dejaBranche = document.querySelector(`[${ATTR_BOUTON_SEND_AUDIO}]`);
  if (dejaBranche instanceof HTMLElement) {
    return dejaBranche;
  }
  const candidats = document.querySelectorAll(".new-track");
  for (const candidat of candidats) {
    if (texteBouton(candidat) === "Add Raspberry Pi" && candidat instanceof HTMLElement) {
      return candidat;
    }
  }
  return null;
}

function creerBoutonAudio(
  modele: HTMLElement,
  attribut: string,
  libelle: string,
  onClick: () => void
): HTMLElement {
  const bouton = modele.cloneNode(true) as HTMLElement;
  bouton.setAttribute(attribut, "1");
  const texte = bouton.querySelector(".new-track-text");
  if (texte) {
    texte.textContent = libelle;
  }
  bouton.addEventListener("click", onClick);
  return bouton;
}

/**
 * Remplace le bouton factice « Add Raspberry Pi » par Send Audio et Delete Audio.
 */
export function brancherBoutonsAudio(params: {
  onSendAudio: () => void;
  onDeleteAudio: () => void;
  onImportAudio: () => void;
}): void {
  const conteneurExistant = document.querySelector(`[${ATTR_CONTENEUR_BOUTONS}]`);
  if (conteneurExistant instanceof HTMLElement) {
    if (!conteneurExistant.querySelector(`[${ATTR_BOUTON_IMPORT_AUDIO}]`)) {
      const modele = conteneurExistant.querySelector(`[${ATTR_BOUTON_SEND_AUDIO}]`);
      if (modele instanceof HTMLElement) {
        conteneurExistant.insertBefore(
          creerBoutonAudio(modele, ATTR_BOUTON_IMPORT_AUDIO, "Import Audio", params.onImportAudio),
          conteneurExistant.querySelector(`[${ATTR_BOUTON_DELETE_AUDIO}]`)
        );
      }
    }
    return;
  }

  const bouton = trouverBoutonAddRaspberryPi();
  if (!bouton) {
    return;
  }

  const conteneur = document.createElement("div");
  conteneur.setAttribute(ATTR_CONTENEUR_BOUTONS, "1");
  conteneur.style.display = "flex";
  conteneur.style.gap = "8px";
  conteneur.style.flexWrap = "wrap";

  conteneur.appendChild(
    creerBoutonAudio(bouton, ATTR_BOUTON_SEND_AUDIO, "Send Audio", params.onSendAudio)
  );
  conteneur.appendChild(
    creerBoutonAudio(bouton, ATTR_BOUTON_IMPORT_AUDIO, "Import Audio", params.onImportAudio)
  );
  conteneur.appendChild(
    creerBoutonAudio(bouton, ATTR_BOUTON_DELETE_AUDIO, "Delete Audio", params.onDeleteAudio)
  );

  bouton.replaceWith(conteneur);
}

/** @deprecated Utiliser brancherBoutonsAudio. */
export function brancherBoutonSendAudio(onClick: () => void): void {
  brancherBoutonsAudio({
    onSendAudio: onClick,
    onImportAudio: () => undefined,
    onDeleteAudio: () => undefined,
  });
}
