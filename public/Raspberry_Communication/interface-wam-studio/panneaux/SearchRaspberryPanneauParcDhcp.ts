import { lireCheminDossierDepuisChamp, normaliserCheminDossierOpenDhcp } from "../utilitaires/SearchRaspberryUtilitairesOpenDhcp";

export type EntreeCatalogueParc = { number: number; mac: string; ipAddress: string };

export type HotePanneauParcDhcp = {
  parcPanel: HTMLDivElement;
  parcSelect: HTMLSelectElement;
  parcStatusText: HTMLDivElement;
  iniPathInput: HTMLInputElement;
  iniPathStorageKey: string;
  defaultOpenDhcpFolder: string;
  lireSubnetPrefix: () => string;
  ecrireSubnetPrefix: (prefix: string) => void;
  sendMessage: (message: Record<string, unknown> & { type: string }) => boolean;
  buildIpFromNumber: (number: number) => string;
  mergeListenNumbers: (activeNumbers: number[], catalog: EntreeCatalogueParc[]) => number[];
  updateActiveExpectedFromNumbers: (activeNumbers: number[]) => void;
};

export function monterPanneauParcDhcp(hote: HotePanneauParcDhcp, onScan: () => void, onApply: () => void): void {
  hote.parcPanel.id = "search-raspberry-parc-panel";
  hote.parcPanel.style.marginTop = "8px";
  hote.parcPanel.style.padding = "8px";
  hote.parcPanel.style.border = "1px solid #3b4046";
  hote.parcPanel.style.borderRadius = "8px";
  hote.parcPanel.style.backgroundColor = "#1a2026";

  const title = document.createElement("div");
  title.innerHTML = "<strong>Parc Raspberry (Open DHCP)</strong>";
  title.style.marginBottom = "8px";
  hote.parcPanel.appendChild(title);

  const parcFolderHint = document.createElement("div");
  parcFolderHint.innerText = "Le dossier du fichier INI se configure dans Ajouter.";
  parcFolderHint.style.fontSize = "11px";
  parcFolderHint.style.opacity = "0.75";
  parcFolderHint.style.marginBottom = "8px";
  hote.parcPanel.appendChild(parcFolderHint);

  const selectLabel = document.createElement("div");
  selectLabel.innerText = "Raspberry a ecouter (gris = deja dans le INI, non modifiable)";
  selectLabel.style.marginBottom = "4px";
  selectLabel.style.opacity = "0.9";
  hote.parcPanel.appendChild(selectLabel);

  hote.parcSelect.multiple = true;
  hote.parcSelect.size = 8;
  hote.parcSelect.style.width = "100%";
  hote.parcSelect.style.marginBottom = "8px";
  hote.parcSelect.style.backgroundColor = "#1f252b";
  hote.parcSelect.style.color = "#f1f1f1";
  hote.parcPanel.appendChild(hote.parcSelect);

  const buttonsRow = document.createElement("div");
  buttonsRow.style.display = "flex";
  buttonsRow.style.gap = "8px";
  buttonsRow.style.flexWrap = "wrap";
  buttonsRow.style.marginBottom = "8px";

  const scanBtn = document.createElement("button");
  scanBtn.innerText = "Scanner le INI";
  scanBtn.className = "btn btn-sm btn-secondary";
  scanBtn.addEventListener("click", onScan);

  const applyBtn = document.createElement("button");
  applyBtn.innerText = "Appliquer l'ecoute";
  applyBtn.className = "btn btn-sm btn-primary";
  applyBtn.title = "Met a jour la liste ecoutee par le serveur sans modifier le fichier INI";
  applyBtn.addEventListener("click", onApply);

  buttonsRow.appendChild(scanBtn);
  buttonsRow.appendChild(applyBtn);
  hote.parcPanel.appendChild(buttonsRow);

  hote.parcStatusText.style.fontSize = "12px";
  hote.parcStatusText.style.opacity = "0.9";
  hote.parcStatusText.innerText = "Scannez le INI puis selectionnez les Raspberry a ecouter.";
  hote.parcPanel.appendChild(hote.parcStatusText);
}

export function lireNumerosParcSelectionnes(parcSelect: HTMLSelectElement): number[] {
  const numbers: number[] = [];
  Array.from(parcSelect.options).forEach((option) => {
    if (!option.selected) {
      return;
    }
    const parsed = Number.parseInt(option.value, 10);
    if (Number.isFinite(parsed)) {
      numbers.push(parsed);
    }
  });
  return numbers.sort((a, b) => a - b);
}

export function reconstruireSelectParc(
  hote: Pick<HotePanneauParcDhcp, "parcSelect" | "buildIpFromNumber">,
  catalog: EntreeCatalogueParc[],
  listenNumbers: number[]
): void {
  hote.parcSelect.innerHTML = "";
  const catalogNumbers = new Set(catalog.map((entry) => entry.number));

  if (catalog.length === 0 && listenNumbers.length === 0) {
    const emptyOption = document.createElement("option");
    emptyOption.innerText = "Aucun Raspberry trouve dans le INI";
    emptyOption.disabled = true;
    hote.parcSelect.appendChild(emptyOption);
    return;
  }

  catalog.forEach((entry) => {
    const option = document.createElement("option");
    option.value = `${entry.number}`;
    const macText = entry.mac && entry.mac.length > 0 ? entry.mac : "MAC inconnue";
    option.innerText = `Raspberry ${entry.number} - ${entry.ipAddress} - ${macText} [deja dans INI]`;
    option.selected = true;
    option.disabled = true;
    option.style.color = "#9aa0a6";
    option.style.backgroundColor = "#2b3036";
    hote.parcSelect.appendChild(option);
  });

  listenNumbers.forEach((number) => {
    if (catalogNumbers.has(number)) {
      return;
    }
    const option = document.createElement("option");
    option.value = `${number}`;
    option.innerText = `Raspberry ${number} - ${hote.buildIpFromNumber(number)} - (selection manuelle)`;
    option.selected = true;
    hote.parcSelect.appendChild(option);
  });
}

export function scannerFichierIni(hote: HotePanneauParcDhcp): void {
  const folderPath = lireCheminDossierDepuisChamp(hote.iniPathInput, hote.iniPathStorageKey, hote.defaultOpenDhcpFolder);
  hote.parcStatusText.innerText = `Recherche d'un fichier .ini dans ${folderPath} ...`;
  hote.sendMessage({ type: "scanOpenDhcpIni", iniPath: folderPath });
}

export function appliquerSelectionParc(hote: HotePanneauParcDhcp): void {
  const folderPath = lireCheminDossierDepuisChamp(hote.iniPathInput, hote.iniPathStorageKey, hote.defaultOpenDhcpFolder);
  const selectedNumbers = lireNumerosParcSelectionnes(hote.parcSelect);
  if (folderPath.length === 0) {
    hote.parcStatusText.innerText = "Dossier Open DHCP manquant.";
    return;
  }
  if (selectedNumbers.length === 0) {
    hote.parcStatusText.innerText = "Selectionne au moins un Raspberry.";
    return;
  }
  hote.parcStatusText.innerText = "Application de la liste a ecouter...";
  hote.sendMessage({
    type: "applyRaspberryParc",
    iniPath: folderPath,
    selectedNumbers,
  });
}

export function appliquerEtatParcServeur(hote: HotePanneauParcDhcp, payload: any): void {
  if (typeof payload.subnetPrefix === "string" && payload.subnetPrefix.length > 0) {
    hote.ecrireSubnetPrefix(payload.subnetPrefix);
  }
  const folderFromServer = typeof payload.iniFolder === "string"
    ? payload.iniFolder
    : (typeof payload.iniPath === "string" ? payload.iniPath : "");
  if (folderFromServer.length > 0) {
    hote.iniPathInput.value = normaliserCheminDossierOpenDhcp(folderFromServer);
    window.localStorage.setItem(hote.iniPathStorageKey, hote.iniPathInput.value);
  }
  const activeNumbers = Array.isArray(payload.activeNumbers)
    ? payload.activeNumbers
        .map((value: unknown) => Number.parseInt(`${value}`, 10))
        .filter((value: number) => Number.isFinite(value))
    : [];
  const catalog = Array.isArray(payload.catalog) ? payload.catalog : [];
  const listenNumbers = Array.isArray(payload.listenNumbers)
    ? payload.listenNumbers
        .map((value: unknown) => Number.parseInt(`${value}`, 10))
        .filter((value: number) => Number.isFinite(value))
    : hote.mergeListenNumbers(activeNumbers, catalog);

  hote.updateActiveExpectedFromNumbers(listenNumbers);
  reconstruireSelectParc(hote, catalog, listenNumbers);

  if (payload.scanOk === false && typeof payload.scanError === "string" && payload.scanError.length > 0) {
    hote.parcStatusText.innerText = payload.scanError;
    return;
  }
  const iniName = typeof payload.iniFileName === "string" && payload.iniFileName.length > 0
    ? payload.iniFileName
    : "";
  const iniText = iniName.length > 0 ? `Fichier INI: ${iniName}. ` : "";
  hote.parcStatusText.innerText =
    `${iniText}A ecouter: ${listenNumbers.join(", ") || "aucun"} ` +
    `(${catalog.length} trouve(s) dans le INI).`;
}
