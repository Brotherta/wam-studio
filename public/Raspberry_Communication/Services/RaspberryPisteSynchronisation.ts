/**
 * Declencheurs de synchronisation pistes ↔ Raspberry (apres chargement projet, etc.).
 */
type CallbackSynchronisation = () => void;

let callbackSynchronisation: CallbackSynchronisation | null = null;

export function enregistrerSynchronisationPistesRaspberry(
  callback: CallbackSynchronisation
): void {
  callbackSynchronisation = callback;
}

export function declencherSynchronisationPistesRaspberry(): void {
  callbackSynchronisation?.();
}
