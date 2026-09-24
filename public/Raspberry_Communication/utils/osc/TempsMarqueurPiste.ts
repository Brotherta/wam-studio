const RATIO_MS_PAR_PX_DEFAUT = 16.85;

/** Convertit un X canvas (pixels visibles) en temps de piste. */
export function calculerTempsMsDepuisXCanvas(
  xCanvas: number,
  viewportLeft: number,
  ratioMsParPx: number
): number {
  const ratio = ratioMsParPx > 0 ? ratioMsParPx : RATIO_MS_PAR_PX_DEFAUT;
  const ms = (xCanvas + viewportLeft) * ratio;
  if (!Number.isFinite(ms) || ms < 0) {
    return 0;
  }
  return Math.round(ms / 10) * 10;
}
