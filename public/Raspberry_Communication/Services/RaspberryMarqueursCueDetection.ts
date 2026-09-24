export type CueTimeline = {
  id: string;
  tempsMs: number;
};

const MARGE_SUR_CUE_MS = 50;
const MARGE_LIBERATION_MS = 40;

/**
 * Declenche un cue quand la tete de lecture WAM l'atteint (depart pile dessus, ou franchissement).
 */
export function trouverCueADeclencher(params: {
  playheadMs: number;
  playheadPrecedentMs: number;
  enLecture: boolean;
  enLecturePrecedent: boolean;
  cues: CueTimeline[];
  cuesConsommes: ReadonlySet<string>;
}): CueTimeline | null {
  if (!params.enLecture) {
    return null;
  }
  const cues = params.cues
    .filter((cue) => !params.cuesConsommes.has(cue.id))
    .sort((a, b) => a.tempsMs - b.tempsMs);

  if (!params.enLecturePrecedent) {
    for (const cue of cues) {
      if (Math.abs(params.playheadMs - cue.tempsMs) <= MARGE_SUR_CUE_MS) {
        return cue;
      }
    }
  }

  for (const cue of cues) {
    if (params.playheadPrecedentMs < cue.tempsMs && params.playheadMs >= cue.tempsMs) {
      return cue;
    }
  }
  return null;
}

export function idsCuesALiberer(
  playheadMs: number,
  cues: CueTimeline[],
  cuesConsommes: ReadonlySet<string>
): string[] {
  return cues
    .filter((cue) => cuesConsommes.has(cue.id) && playheadMs < cue.tempsMs - MARGE_LIBERATION_MS)
    .map((cue) => cue.id);
}
