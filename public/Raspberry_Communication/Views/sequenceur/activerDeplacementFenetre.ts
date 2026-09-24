/**
 * Permet de deplacer une fenetre flottante en glissant une poignee.
 */
export function activerDeplacementFenetre(
  poignee: HTMLElement,
  fenetre: HTMLElement
): () => void {
  let actif = false;
  let debutX = 0;
  let debutY = 0;
  let origineGauche = 0;
  let origineHaut = 0;

  poignee.style.cursor = "grab";

  const onMove = (event: MouseEvent): void => {
    if (!actif) {
      return;
    }
    const gauche = Math.max(0, origineGauche + event.clientX - debutX);
    const haut = Math.max(0, origineHaut + event.clientY - debutY);
    const maxGauche = Math.max(0, window.innerWidth - fenetre.offsetWidth);
    fenetre.style.left = `${Math.min(maxGauche, gauche)}px`;
    fenetre.style.top = `${haut}px`;
  };

  const onUp = (): void => {
    if (!actif) {
      return;
    }
    actif = false;
    poignee.style.cursor = "grab";
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  const onDown = (event: MouseEvent): void => {
    const cible = event.target as HTMLElement | null;
    if (cible?.closest("input, button, select, textarea")) {
      return;
    }
    const rect = fenetre.getBoundingClientRect();
    actif = true;
    debutX = event.clientX;
    debutY = event.clientY;
    origineGauche = rect.left;
    origineHaut = rect.top;
    fenetre.style.right = "auto";
    fenetre.style.left = `${rect.left}px`;
    fenetre.style.top = `${rect.top}px`;
    poignee.style.cursor = "grabbing";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    event.preventDefault();
  };

  poignee.addEventListener("mousedown", onDown);
  return () => {
    poignee.removeEventListener("mousedown", onDown);
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };
}
