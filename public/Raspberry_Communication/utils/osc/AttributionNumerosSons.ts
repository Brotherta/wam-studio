import { SON_NUMERO_DEFAUT } from "../agent-transfert/AgentTransfertHelpers";

export type AttributionSons = Record<string, number>;

function estFichierAudioNom(nomFichier: string): boolean {
  const nom = nomFichier.trim();
  return nom.length > 0 && !nom.startsWith(".") && /\.(wav|mp3|aiff|aif|flac|ogg)$/i.test(nom);
}

/** Extraire 500 depuis son500.wav ou son500-1.wav. */
export function extraireNumeroSkiniDepuisNom(nomFichier: string): number | null {
  const match = nomFichier.trim().match(/^son(\d+)/i);
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
}

export function estNomSonPersonnalise(nomFichier: string): boolean {
  return extraireNumeroSkiniDepuisNom(nomFichier) === null;
}

export function prochainNumeroWam(numerosOccupes: Iterable<number>): number {
  const wam = [...numerosOccupes].filter(
    (numero) => Number.isFinite(numero) && numero >= SON_NUMERO_DEFAUT
  );
  if (wam.length === 0) {
    return SON_NUMERO_DEFAUT;
  }
  return Math.max(...wam) + 1;
}

export function collecterNumerosOccupes(
  fichiers: string[],
  attributions: AttributionSons
): Set<number> {
  const occupes = new Set<number>();
  for (const nom of fichiers) {
    const numero = extraireNumeroSkiniDepuisNom(nom);
    if (numero !== null) {
      occupes.add(numero);
    }
  }
  for (const numero of Object.values(attributions)) {
    if (Number.isFinite(numero)) {
      occupes.add(numero);
    }
  }
  return occupes;
}

export function reserverProchainNumeroWam(occupes: Set<number>): number {
  const numero = prochainNumeroWam(occupes);
  occupes.add(numero);
  return numero;
}

/**
 * Attribue un numero OSC a chaque fichier :
 * - son500.wav garde 500
 * - believer.wav / extraclass.wav recoivent le suivant (502, 503, ...)
 * Les attributions deja sauvees ne bougent pas.
 */
export function reconstruireAttributions(
  fichiers: string[],
  attributionsSauvees: AttributionSons = {}
): AttributionSons {
  const audio = fichiers.filter((nom) => estFichierAudioNom(nom));
  const resultat: AttributionSons = {};
  const occupes = new Set<number>();

  for (const nom of audio) {
    const numero = extraireNumeroSkiniDepuisNom(nom);
    if (numero !== null) {
      occupes.add(numero);
    }
  }

  for (const nom of audio) {
    if (!estNomSonPersonnalise(nom)) {
      continue;
    }
    const sauve = attributionsSauvees[nom];
    if (typeof sauve === "number" && Number.isFinite(sauve) && !occupes.has(sauve)) {
      resultat[nom] = sauve;
      occupes.add(sauve);
    }
  }

  const restants = audio
    .filter((nom) => estNomSonPersonnalise(nom) && resultat[nom] === undefined)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  for (const nom of restants) {
    resultat[nom] = reserverProchainNumeroWam(occupes);
  }

  return resultat;
}

export function construireNomSonAutomatique(sonNumber: number, extension = ".wav"): string {
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return `son${sonNumber}${ext}`;
}
