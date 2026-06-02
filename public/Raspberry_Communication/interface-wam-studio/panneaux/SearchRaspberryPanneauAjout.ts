import { lireCheminDossierDepuisChamp, normaliserCheminDossierOpenDhcp } from "../utilitaires/SearchRaspberryUtilitairesOpenDhcp";

export type HotePanneauAjout = {
  addPanel: HTMLDivElement;
  addStatusText: HTMLDivElement;
  addMacInput: HTMLInputElement;
  addIpInput: HTMLInputElement;
  iniPathInput: HTMLInputElement;
  iniPathStorageKey: string;
  defaultOpenDhcpFolder: string;
  lireSocket: () => WebSocket | null;
  sendMessage: (message: Record<string, unknown> & { type: string }) => boolean;
};

export function monterChampDossierIni(
  parent: HTMLDivElement,
  iniPathInput: HTMLInputElement,
  iniPathStorageKey: string
): void {
  const iniLabel = document.createElement("div");
  iniLabel.innerText = "Dossier contenant OpenDHCPServer.ini";
  iniLabel.style.marginBottom = "4px";
  iniLabel.style.opacity = "0.9";
  parent.appendChild(iniLabel);

  iniPathInput.type = "text";
  iniPathInput.placeholder = "C:/OpenDHCPServer/";
  iniPathInput.style.width = "100%";
  iniPathInput.style.marginBottom = "4px";
  const storedFolder = window.localStorage.getItem(iniPathStorageKey) || "";
  iniPathInput.value = normaliserCheminDossierOpenDhcp(storedFolder);
  iniPathInput.addEventListener("change", () => {
    iniPathInput.value = normaliserCheminDossierOpenDhcp(iniPathInput.value);
    window.localStorage.setItem(iniPathStorageKey, iniPathInput.value);
  });
  parent.appendChild(iniPathInput);

  const iniHint = document.createElement("div");
  iniHint.innerText = "Si vide: test avec C:/OpenDHCPServer/ par defaut.";
  iniHint.style.fontSize = "11px";
  iniHint.style.opacity = "0.75";
  iniHint.style.marginBottom = "10px";
  parent.appendChild(iniHint);
}

export function monterPanneauAjout(hote: HotePanneauAjout, onAjouter: () => void): void {
  hote.addPanel.id = "search-raspberry-add-panel";
  hote.addPanel.style.marginTop = "8px";
  hote.addPanel.style.padding = "8px";
  hote.addPanel.style.border = "1px solid #3b4046";
  hote.addPanel.style.borderRadius = "8px";
  hote.addPanel.style.backgroundColor = "#1a2026";

  const title = document.createElement("div");
  title.innerHTML = "<strong>Ajouter un Raspberry</strong>";
  title.style.marginBottom = "8px";
  hote.addPanel.appendChild(title);

  monterChampDossierIni(hote.addPanel, hote.iniPathInput, hote.iniPathStorageKey);

  const addForm = document.createElement("div");
  addForm.style.display = "grid";
  addForm.style.gridTemplateColumns = "90px 1fr";
  addForm.style.gap = "6px 10px";

  const macLabel = document.createElement("div");
  macLabel.innerText = "MAC";
  macLabel.style.opacity = "0.9";
  hote.addMacInput.type = "text";
  hote.addMacInput.placeholder = "b8:27:eb:12:34:56";
  hote.addMacInput.style.width = "100%";

  const ipLabel = document.createElement("div");
  ipLabel.innerText = "IP";
  ipLabel.style.opacity = "0.9";
  hote.addIpInput.type = "text";
  hote.addIpInput.placeholder = "192.168.1.76";
  hote.addIpInput.style.width = "100%";

  addForm.appendChild(macLabel);
  addForm.appendChild(hote.addMacInput);
  addForm.appendChild(ipLabel);
  addForm.appendChild(hote.addIpInput);
  hote.addPanel.appendChild(addForm);

  const addBtn = document.createElement("button");
  addBtn.innerText = "Ajouter au INI et a la liste";
  addBtn.className = "btn btn-sm btn-primary";
  addBtn.style.marginTop = "8px";
  addBtn.addEventListener("click", onAjouter);
  hote.addPanel.appendChild(addBtn);

  hote.addStatusText.style.marginTop = "8px";
  hote.addStatusText.style.fontSize = "12px";
  hote.addStatusText.style.opacity = "0.9";
  hote.addStatusText.style.minHeight = "18px";
  hote.addStatusText.innerText = "Indiquez le dossier INI, puis MAC et IP.";
  hote.addPanel.appendChild(hote.addStatusText);
}

export function normaliserMacSaisie(mac: string): string {
  return mac.trim().replace(/-/g, ":").toLowerCase();
}

export function ajouterRaspberryManuellement(hote: HotePanneauAjout): void {
  const macAddress = normaliserMacSaisie(hote.addMacInput.value);
  const ipAddress = hote.addIpInput.value.trim();
  const folderPath = lireCheminDossierDepuisChamp(hote.iniPathInput, hote.iniPathStorageKey, hote.defaultOpenDhcpFolder);

  if (macAddress.length === 0 || ipAddress.length === 0) {
    hote.addStatusText.innerText = "Renseignez la MAC et l'IP du Raspberry a ajouter.";
    return;
  }

  const socket = hote.lireSocket();
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    hote.addStatusText.innerText = "Serveur Raspberry non connecte. Lancez d'abord le serveur (bouton vert).";
    return;
  }

  hote.addStatusText.innerText = `Ajout de ${ipAddress} (${macAddress}) dans le INI...`;
  const sent = hote.sendMessage({
    type: "addRaspberryEntry",
    iniPath: folderPath,
    macAddress,
    ipAddress,
  });
  if (!sent) {
    hote.addStatusText.innerText = "Envoi impossible: connexion WebSocket fermee.";
  }
}
