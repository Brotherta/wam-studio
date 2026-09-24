const PREFIX = "[AgentTransfert]";

export function logTransfertInfo(message: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.info(PREFIX, message, detail);
    return;
  }
  console.info(PREFIX, message);
}

export function logTransfertAvertissement(message: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.warn(PREFIX, message, detail);
    return;
  }
  console.warn(PREFIX, message);
}

export function logTransfertErreur(message: string, erreur?: unknown): void {
  if (erreur !== undefined) {
    console.error(PREFIX, message, erreur);
    return;
  }
  console.error(PREFIX, message);
}
