/** Petite ligne label + champ dans la grille OSC (display:contents). */
export function creerLigneGrilleOsc(texteLabel: string, champ: HTMLElement): HTMLDivElement {
  const ligne = document.createElement("div");
  ligne.style.display = "contents";

  const label = document.createElement("div");
  label.innerText = texteLabel;
  label.style.opacity = "0.9";

  ligne.appendChild(label);
  ligne.appendChild(champ);
  return ligne;
}

export function afficherLigneGrilleOsc(ligne: HTMLElement, visible: boolean): void {
  ligne.style.display = visible ? "contents" : "none";
}
