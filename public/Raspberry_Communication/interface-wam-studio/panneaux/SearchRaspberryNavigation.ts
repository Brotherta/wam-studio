export type HoteNavigation = {
  statusText: HTMLDivElement;
  navBar: HTMLDivElement;
  navBtnList: HTMLButtonElement;
  navBtnParc: HTMLButtonElement;
  navBtnAdd: HTMLButtonElement;
  navBtnStats: HTMLButtonElement;
  listPanel: HTMLDivElement;
  parcPanel: HTMLDivElement;
  addPanel: HTMLDivElement;
  statsPanel: HTMLDivElement;
  raspberryList: HTMLUListElement;
  detailsBox: HTMLDivElement;
  activePanelId: string | null;
  onAfficherListe: () => void;
  onAfficherStats: () => void;
};

function configurerBoutonNav(button: HTMLButtonElement, label: string, onClick: () => void): void {
  button.innerText = label;
  button.className = "btn btn-sm btn-secondary";
  button.addEventListener("click", onClick);
}

export function monterNavigationEtPanneaux(hote: HoteNavigation): void {
  const settingsBody = hote.statusText.parentElement as HTMLDivElement | null;
  if (!settingsBody) {
    return;
  }

  hote.navBar.id = "search-raspberry-nav";
  hote.navBar.style.display = "flex";
  hote.navBar.style.flexWrap = "wrap";
  hote.navBar.style.gap = "8px";
  hote.navBar.style.marginTop = "8px";
  hote.navBar.style.marginBottom = "8px";

  configurerBoutonNav(hote.navBtnList, "Liste Raspberry", () => afficherPanneau(hote, "list"));
  configurerBoutonNav(hote.navBtnParc, "Parc / DHCP", () => afficherPanneau(hote, "parc"));
  configurerBoutonNav(hote.navBtnAdd, "Ajouter", () => afficherPanneau(hote, "add"));
  configurerBoutonNav(hote.navBtnStats, "Infos serveur", () => afficherPanneau(hote, "stats"));

  hote.navBar.appendChild(hote.navBtnList);
  hote.navBar.appendChild(hote.navBtnParc);
  hote.navBar.appendChild(hote.navBtnAdd);
  hote.navBar.appendChild(hote.navBtnStats);

  hote.listPanel.id = "search-raspberry-list-panel";
  hote.listPanel.style.display = "flex";
  hote.listPanel.style.flexDirection = "column";
  hote.listPanel.style.gap = "8px";
  hote.raspberryList.style.maxHeight = "220px";
  hote.raspberryList.style.overflowY = "auto";
  hote.raspberryList.style.flexShrink = "0";
  hote.raspberryList.style.margin = "0";
  hote.raspberryList.style.padding = "0";
  hote.detailsBox.style.flexShrink = "0";

  const listHint = document.createElement("div");
  listHint.innerText = "Cliquez sur un Raspberry pour afficher ou masquer ses informations.";
  listHint.style.fontSize = "11px";
  listHint.style.opacity = "0.75";
  listHint.style.marginBottom = "8px";
  hote.listPanel.appendChild(listHint);
  hote.listPanel.appendChild(hote.raspberryList);
  hote.listPanel.appendChild(hote.detailsBox);

  settingsBody.appendChild(hote.navBar);
  settingsBody.appendChild(hote.listPanel);
  settingsBody.appendChild(hote.parcPanel);
  settingsBody.appendChild(hote.addPanel);
  settingsBody.appendChild(hote.statsPanel);

  masquerTousPanneaux(hote);
  mettreAJourBoutonsNavigation(hote);
}

export function masquerTousPanneaux(hote: HoteNavigation): void {
  hote.activePanelId = null;
  hote.listPanel.hidden = true;
  hote.parcPanel.hidden = true;
  hote.addPanel.hidden = true;
  hote.statsPanel.hidden = true;
  hote.detailsBox.hidden = true;
  mettreAJourBoutonsNavigation(hote);
}

export function afficherPanneauListe(hote: HoteNavigation): void {
  if (hote.activePanelId === "list" && !hote.listPanel.hidden) {
    return;
  }
  masquerTousPanneaux(hote);
  hote.activePanelId = "list";
  hote.listPanel.hidden = false;
  mettreAJourBoutonsNavigation(hote);
  hote.onAfficherListe();
}

function afficherPanneau(hote: HoteNavigation, panelId: string): void {
  if (hote.activePanelId === panelId) {
    masquerTousPanneaux(hote);
    return;
  }
  masquerTousPanneaux(hote);
  hote.activePanelId = panelId;

  if (panelId === "list") {
    hote.listPanel.hidden = false;
    hote.onAfficherListe();
  } else if (panelId === "parc") {
    hote.parcPanel.hidden = false;
  } else if (panelId === "add") {
    hote.addPanel.hidden = false;
  } else if (panelId === "stats") {
    hote.statsPanel.hidden = false;
    hote.onAfficherStats();
  }
  mettreAJourBoutonsNavigation(hote);
}

function mettreAJourBoutonsNavigation(hote: HoteNavigation): void {
  const active = hote.activePanelId;
  const buttons = [
    { button: hote.navBtnList, id: "list" },
    { button: hote.navBtnParc, id: "parc" },
    { button: hote.navBtnAdd, id: "add" },
    { button: hote.navBtnStats, id: "stats" },
  ];
  buttons.forEach((entry) => {
    const isActive = active === entry.id;
    entry.button.className = isActive ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary";
  });
}
