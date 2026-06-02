import Raspberry from "../../Raspberry";
import { construirePanneauOsc, HotePanneauOsc } from "./SearchRaspberryPanneauOsc";

export type HotePanneauListe = HotePanneauOsc & {
  raspberryMap: Map<string, Raspberry>;
  raspberryList: HTMLUListElement;
  detailsBox: HTMLDivElement;
  selectedRaspberryIp: string | null;
  detailsVisible: boolean;
  afficherPanneauListe: () => void;
  mettreAJourListe: () => void;
};

export function configurerBoiteDetails(hote: Pick<HotePanneauListe, "detailsBox">): void {
  hote.detailsBox.id = "search-raspberry-details";
  hote.detailsBox.hidden = true;
  hote.detailsBox.style.marginTop = "10px";
  hote.detailsBox.style.padding = "8px";
  hote.detailsBox.style.border = "1px solid #3b4046";
  hote.detailsBox.style.borderRadius = "8px";
  hote.detailsBox.style.backgroundColor = "#1f252b";
  hote.detailsBox.style.color = "#f1f1f1";
}

export function afficherMessageAucuneSelection(hote: Pick<HotePanneauListe, "detailsBox">): void {
  hote.detailsBox.innerHTML = "Clique sur un Raspberry pour voir ses informations.";
}

export function afficherDetailsRaspberry(hote: HotePanneauListe, raspberry: Raspberry): void {
  const onlineText = raspberry.isOnline ? "En ligne" : "Hors ligne";
  const infoText = raspberry.info && raspberry.info.length > 0 ? raspberry.info : "Aucune information detaillee";
  const macText = raspberry.mac.length > 0 ? raspberry.mac : "MAC inconnue";
  const offlineReasonText = raspberry.isOnline ? "Aucune" : raspberry.offlineReason;
  const networkStateText = raspberry.pingOk || raspberry.arpSeen ? "Joignable (ping/arp)" : "Non joignable";
  const networkTimeText = raspberry.networkCheckedAtMs > 0
    ? new Date(raspberry.networkCheckedAtMs).toLocaleTimeString()
    : "Jamais";
  hote.detailsBox.innerHTML =
    `<div><strong>IP:</strong> ${raspberry.ip}</div>` +
    `<div><strong>MAC:</strong> ${macText}</div>` +
    `<div><strong>Etat:</strong> ${onlineText}</div>` +
    `<div><strong>Etat reseau:</strong> ${networkStateText}</div>` +
    `<div><strong>Dernier check reseau:</strong> ${networkTimeText}</div>` +
    `<div><strong>Dernier heartbeat:</strong> ${raspberry.lastUpdateText}</div>` +
    `<div><strong>Raison offline:</strong> ${offlineReasonText}</div>` +
    `<div><strong>Info:</strong> ${infoText}</div>`;

  hote.detailsBox.appendChild(construirePanneauOsc(hote, raspberry));
}

function editionEnCoursDansDetails(hote: HotePanneauListe): boolean {
  const active = document.activeElement as HTMLElement | null;
  if (!active || !hote.detailsBox.contains(active)) {
    return false;
  }
  const tag = active.tagName.toUpperCase();
  return tag === "INPUT" || tag === "TEXTAREA";
}

export function basculerDetailsRaspberry(hote: HotePanneauListe, ip: string, raspberry: Raspberry): void {
  hote.afficherPanneauListe();
  if (hote.selectedRaspberryIp === ip && hote.detailsVisible) {
    hote.selectedRaspberryIp = null;
    hote.detailsVisible = false;
    hote.detailsBox.hidden = true;
    hote.mettreAJourListe();
    return;
  }
  hote.selectedRaspberryIp = ip;
  hote.detailsVisible = true;
  hote.detailsBox.hidden = false;
  hote.mettreAJourListe();
  afficherDetailsRaspberry(hote, raspberry);
}

export function rafraichirListeRaspberry(hote: HotePanneauListe): void {
  hote.raspberryList.innerHTML = "";
  if (hote.raspberryMap.size === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.innerText = "Aucun Raspberry detecte pour le moment.";
    hote.raspberryList.appendChild(emptyItem);
    if (hote.detailsVisible) {
      afficherMessageAucuneSelection(hote);
    }
    return;
  }

  hote.raspberryMap.forEach((raspberry, ip) => {
    const item = document.createElement("li");
    const onlineText = raspberry.isOnline ? "En ligne" : "Hors ligne";
    const macText = raspberry.mac.length > 0 ? raspberry.mac : "MAC inconnue";
    const networkText = raspberry.pingOk || raspberry.arpSeen ? "Reseau OK" : "Reseau KO";
    item.innerText = `${ip} - ${macText} (${onlineText}, ${networkText})`;
    item.style.cursor = "pointer";
    item.style.padding = "4px 6px";
    item.style.borderRadius = "6px";
    item.style.backgroundColor = raspberry.isOnline ? "#1f8b4c" : "#a53333";
    if (hote.selectedRaspberryIp === ip) {
      item.style.backgroundColor = "#2f3640";
    }
    item.addEventListener("click", () => {
      basculerDetailsRaspberry(hote, ip, raspberry);
    });
    hote.raspberryList.appendChild(item);
  });

  if (hote.selectedRaspberryIp && hote.detailsVisible) {
    const selected = hote.raspberryMap.get(hote.selectedRaspberryIp);
    if (selected) {
      if (!editionEnCoursDansDetails(hote)) {
        afficherDetailsRaspberry(hote, selected);
      }
      return;
    }
    hote.selectedRaspberryIp = null;
    hote.detailsVisible = false;
  }
  if (hote.detailsVisible) {
    afficherMessageAucuneSelection(hote);
  }
}

export function rafraichirDetailsSiSelection(hote: HotePanneauListe, ip: string): void {
  if (hote.selectedRaspberryIp !== ip || !hote.detailsVisible) {
    return;
  }
  const raspberry = hote.raspberryMap.get(ip);
  if (!raspberry) {
    return;
  }
  afficherDetailsRaspberry(hote, raspberry);
}
