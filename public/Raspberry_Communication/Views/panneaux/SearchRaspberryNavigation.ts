export type HoteNavigation = {
  listPanel: HTMLDivElement;
  raspberryList: HTMLUListElement;
  detailsBox: HTMLDivElement;
  onAfficherListe: () => void;
  onSynchroniserDepuisReseau: () => void;
};

export function monterPanneauListePrincipal(hote: HoteNavigation): void {
  const settingsBody = document.getElementById("search-raspberry-status")?.parentElement as HTMLDivElement | null;
  if (!settingsBody) {
    return;
  }

  hote.listPanel.id = "search-raspberry-list-panel";
  hote.listPanel.style.display = "flex";
  hote.listPanel.style.flexDirection = "column";
  hote.listPanel.style.gap = "8px";
  hote.raspberryList.style.maxHeight = "280px";
  hote.raspberryList.style.overflowY = "auto";
  hote.raspberryList.style.flexShrink = "0";
  hote.raspberryList.style.margin = "0";
  hote.raspberryList.style.padding = "0";
  hote.detailsBox.style.flexShrink = "0";

  const syncButton = document.createElement("button");
  syncButton.type = "button";
  syncButton.innerText = "Synchroniser depuis le reseau";
  syncButton.title = "Ajoute a la liste WAM les Raspberry vus sur 192.168.1.x. Le DHCP n'est pas modifie.";
  syncButton.style.padding = "6px 10px";
  syncButton.style.cursor = "pointer";
  syncButton.style.borderRadius = "6px";
  syncButton.style.border = "1px solid #3b4046";
  syncButton.style.backgroundColor = "#2f3640";
  syncButton.style.color = "#f1f1f1";
  syncButton.addEventListener("click", () => {
    hote.onSynchroniserDepuisReseau();
  });

  const listHint = document.createElement("div");
  listHint.innerText = "Vert = en ligne, rouge = hors ligne. Cliquez pour envoyer une commande OSC.";
  listHint.style.fontSize = "11px";
  listHint.style.opacity = "0.75";
  listHint.style.marginBottom = "8px";
  hote.listPanel.appendChild(syncButton);
  hote.listPanel.appendChild(listHint);
  hote.listPanel.appendChild(hote.raspberryList);
  hote.listPanel.appendChild(hote.detailsBox);

  settingsBody.appendChild(hote.listPanel);
  afficherPanneauListe(hote);
}

export function afficherPanneauListe(hote: HoteNavigation): void {
  hote.listPanel.hidden = false;
  hote.onAfficherListe();
}

export function masquerPanneauListe(hote: HoteNavigation): void {
  hote.listPanel.hidden = true;
  hote.detailsBox.hidden = true;
}
