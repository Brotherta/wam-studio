/** Formate une position de piste : 100000 ms → "1min40". */
export function formaterTempsPiste(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const secondes = totalSec % 60;
  if (minutes === 0) {
    return `${secondes}s`;
  }
  return `${minutes}min${secondes.toString().padStart(2, "0")}`;
}

/**
 * Accepte "1min40", "1:40", "40s" ou un nombre de secondes.
 */
export function parserTempsPiste(brut: string): number | null {
  const texte = brut.trim().toLowerCase().replace(",", ".");
  if (!texte) {
    return null;
  }
  const minSec = texte.match(/^(\d+)\s*min\s*(\d{1,2})$/);
  if (minSec) {
    return (Number(minSec[1]) * 60 + Number(minSec[2])) * 1000;
  }
  const deuxPoints = texte.match(/^(\d+)\s*:\s*(\d{1,2})$/);
  if (deuxPoints) {
    return (Number(deuxPoints[1]) * 60 + Number(deuxPoints[2])) * 1000;
  }
  const secondes = texte.match(/^(\d+(?:\.\d+)?)\s*s$/);
  if (secondes) {
    return Math.round(Number(secondes[1]) * 1000);
  }
  if (/^\d+(?:\.\d+)?$/.test(texte)) {
    return Math.round(Number(texte) * 1000);
  }
  return null;
}
