/** Chemins dossier Open DHCP (INI). */

export function normaliserCheminDossierOpenDhcp(rawPath: string): string {
  const trimmed = rawPath.trim().replace(/\\/g, "/");
  if (trimmed.length === 0) {
    return "";
  }
  if (trimmed.toLowerCase().endsWith(".ini")) {
    const lastSlash = trimmed.lastIndexOf("/");
    return lastSlash >= 0 ? trimmed.slice(0, lastSlash + 1) : "";
  }
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

export function lireCheminDossierDepuisChamp(
  iniPathInput: HTMLInputElement,
  iniPathStorageKey: string,
  defaultOpenDhcpFolder: string
): string {
  const raw = iniPathInput.value.trim();
  const folder = raw.length > 0 ? normaliserCheminDossierOpenDhcp(raw) : defaultOpenDhcpFolder;
  iniPathInput.value = folder;
  window.localStorage.setItem(iniPathStorageKey, folder);
  return folder;
}
