export type TypeMarqueurSequenceur = "osc" | "cue";

export type MarqueurSequenceur = {
  id: string;
  type: TypeMarqueurSequenceur;
  tempsMs: number;
  libelle: string;
  oscAdresse: string;
  oscValeur: string;
};
