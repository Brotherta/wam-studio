export type ProgressionScp = {
  current: number;
  total: number;
};

export type OptionsUploadAtomique = {
  localPath: string;
  remotePathFinal: string;
  remotePathPart: string;
  remoteDirectory: string;
  tailleTotale: number;
  signal?: AbortSignal;
  onProgress: (progression: ProgressionScp) => void;
  onConnexion?: (fermer: () => void) => void;
};

export interface IScpClient {
  uploadFichierAtomique(params: OptionsUploadAtomique): Promise<void>;
}
