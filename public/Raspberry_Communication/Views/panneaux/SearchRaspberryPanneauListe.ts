import Raspberry from "../../Models/Raspberry";
import type { RaspberryTrackBinding } from "../../Models/RaspberryTrackBinding";
import { texteStatutLiaisonPiste } from "../../Services/RaspberryIndicateurPisteUi";
import { formaterNomAffichageRaspberry } from "../../utils/agent-transfert/AgentTransfertHelpers";
import { construirePanneauOsc, HotePanneauOsc } from "./SearchRaspberryPanneauOsc";

export type HotePanneauListe = HotePanneauOsc & {
  raspberryMap: Map<string, Raspberry>;
  raspberryList: HTMLUListElement;
  detailsBox: HTMLDivElement;
  selectedRaspberryIp: string | null;
  detailsVisible: boolean;
  activeExpectedIps: string[];
  ouvrirFenetreTransfert: (raspberry: Raspberry) => void;
  lireBindingPourIp: (ip: string) => RaspberryTrackBinding | undefined;
  creerOuAllerVersPiste: (raspberry: Raspberry) => void;
  envoyerPisteVersRaspberry: (raspberry: Raspberry) => void;
  lireStatutEnvoiPiste: (ip: string) => string | undefined;
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
  hote.detailsBox.removeAttribute("data-details-ip");
  hote.detailsBox.innerHTML = "Clique sur un Raspberry pour voir ses informations.";
}

function texteEnteteRaspberry(raspberry: Raspberry): string {
  const onlineText = raspberry.isOnline ? "En ligne" : "Hors ligne";
  const nom = formaterNomAffichageRaspberry(raspberry.ip, raspberry.info);
  return `<strong>${nom}</strong> (${raspberry.ip}) — ${onlineText}`;
}

function mettreAJourEnteteDetails(hote: HotePanneauListe, raspberry: Raspberry): void {
  const entete = hote.detailsBox.querySelector("[data-raspberry-details-header]");
  if (entete) {
    entete.innerHTML = texteEnteteRaspberry(raspberry);
  }
}

export function afficherDetailsRaspberry(hote: HotePanneauListe, raspberry: Raspberry): void {
  hote.detailsBox.innerHTML = "";
  hote.detailsBox.setAttribute("data-details-ip", raspberry.ip);
  const entete = document.createElement("div");
  entete.setAttribute("data-raspberry-details-header", "1");
  entete.innerHTML = texteEnteteRaspberry(raspberry);
  hote.detailsBox.appendChild(entete);
  hote.detailsBox.appendChild(construirePanneauLiaisonPiste(hote, raspberry));
  hote.detailsBox.appendChild(construirePanneauOsc(hote, raspberry));
  hote.detailsBox.appendChild(construireBoutonOuvrirTransfert(hote, raspberry));
}

function detailsDejaAffichesPour(hote: HotePanneauListe, ip: string): boolean {
  return (
    hote.detailsBox.getAttribute("data-details-ip") === ip &&
    !!hote.detailsBox.querySelector("[data-raspberry-details-header]")
  );
}

function mettreAJourDetailsLegers(hote: HotePanneauListe, raspberry: Raspberry): void {
  mettreAJourEnteteDetails(hote, raspberry);
  const oscStatus = hote.detailsBox.querySelector("[data-osc-status]") as HTMLElement | null;
  const last = hote.oscLastStatusByIp.get(raspberry.ip);
  if (oscStatus && last) {
    oscStatus.style.borderColor = last.ok ? "#1f8b4c" : "#a53333";
    oscStatus.style.opacity = "1";
    oscStatus.innerText = last.text;
  }
  const statutEnvoi = hote.detailsBox.querySelector("[data-piste-envoi-statut]") as HTMLElement | null;
  if (statutEnvoi) {
    const texte = hote.lireStatutEnvoiPiste(raspberry.ip);
    if (texte) {
      statutEnvoi.innerText = texte;
    }
  }
}

function construirePanneauLiaisonPiste(
  hote: Pick<
    HotePanneauListe,
    | "lireBindingPourIp"
    | "creerOuAllerVersPiste"
    | "envoyerPisteVersRaspberry"
    | "lireStatutEnvoiPiste"
  >,
  raspberry: Raspberry
): HTMLDivElement {
  const row = document.createElement("div");
  row.style.marginTop = "10px";
  row.style.paddingBottom = "10px";
  row.style.borderBottom = "1px solid #2f363d";

  const titre = document.createElement("div");
  titre.style.fontWeight = "600";
  titre.style.marginBottom = "6px";
  titre.innerText = "Piste WAM";

  const hint = document.createElement("div");
  hint.style.fontSize = "11px";
  hint.style.opacity = "0.75";
  hint.style.marginBottom = "8px";

  const binding = hote.lireBindingPourIp(raspberry.ip);
  const numero = raspberry.ip.match(/\.(\d+)$/)?.[1];

  if (!numero) {
    hint.innerText = "Adresse IP invalide pour creer une piste.";
    row.appendChild(titre);
    row.appendChild(hint);
    return row;
  }

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-sm btn-success";
  btn.style.marginRight = "8px";

  if (binding) {
    hint.innerText = texteStatutLiaisonPiste(binding);
    btn.innerText = "Aller a la piste";
    btn.title = "Fait defiler l'editeur vers la piste liee";
  } else {
    hint.innerText =
      "Une piste est creee automatiquement quand ce Raspberry passe en ligne.";
    btn.innerText = `Creer piste rasp ${numero}`;
    btn.title = "Force la creation si la detection auto n'a pas encore eu lieu";
  }

  btn.addEventListener("click", () => hote.creerOuAllerVersPiste(raspberry));

  row.appendChild(titre);
  row.appendChild(hint);
  row.appendChild(btn);

  if (binding) {
    const btnEnvoyer = document.createElement("button");
    btnEnvoyer.type = "button";
    btnEnvoyer.className = "btn btn-sm btn-primary";
    btnEnvoyer.style.marginTop = "8px";
    btnEnvoyer.innerText = "Envoyer piste vers Raspberry";
    btnEnvoyer.disabled = !raspberry.isOnline;
    btnEnvoyer.title = raspberry.isOnline
      ? "Exporte la piste (WAV avec silences) vers sons/son500.wav sur le Pi"
      : "Raspberry hors ligne";
    btnEnvoyer.addEventListener("click", () => hote.envoyerPisteVersRaspberry(raspberry));
    row.appendChild(btnEnvoyer);

    const statutEnvoi = document.createElement("div");
    statutEnvoi.setAttribute("data-piste-envoi-statut", "1");
    statutEnvoi.style.fontSize = "11px";
    statutEnvoi.style.marginTop = "6px";
    statutEnvoi.style.opacity = "0.85";
    const texteStatut = hote.lireStatutEnvoiPiste(raspberry.ip);
    if (texteStatut) {
      statutEnvoi.innerText = texteStatut;
    }
    row.appendChild(statutEnvoi);
  }

  return row;
}

function construireBoutonOuvrirTransfert(
  hote: Pick<HotePanneauListe, "ouvrirFenetreTransfert">,
  raspberry: Raspberry
): HTMLDivElement {
  const row = document.createElement("div");
  row.style.marginTop = "12px";
  row.style.paddingTop = "10px";
  row.style.borderTop = "1px solid #2f363d";

  const hint = document.createElement("div");
  hint.style.fontSize = "11px";
  hint.style.opacity = "0.75";
  hint.style.marginBottom = "8px";
  hint.innerText = "Envoyer un fichier audio (.wav / .mp3) sur ce Raspberry.";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-sm btn-primary";
  btn.innerText = "Ouvrir la fenetre de transfert";
  btn.disabled = !raspberry.isOnline;
  btn.title = raspberry.isOnline
    ? "Ouvre une fenetre dediee pour l'envoi de fichier"
    : "Raspberry hors ligne";
  btn.addEventListener("click", () => hote.ouvrirFenetreTransfert(raspberry));

  row.appendChild(hint);
  row.appendChild(btn);
  return row;
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
  const ipsAffiches = hote.activeExpectedIps.length > 0
    ? hote.activeExpectedIps
    : Array.from(hote.raspberryMap.keys());

  if (ipsAffiches.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.innerText = "Aucun Raspberry dans le fichier Open DHCP (.ini).";
    hote.raspberryList.appendChild(emptyItem);
    if (hote.detailsVisible) {
      afficherMessageAucuneSelection(hote);
    }
    return;
  }

  ipsAffiches.forEach((ip) => {
    const raspberry = hote.raspberryMap.get(ip);
    if (!raspberry) {
      return;
    }
    const item = document.createElement("li");
    const onlineText = raspberry.isOnline ? "En ligne" : "Hors ligne";
    const nom = formaterNomAffichageRaspberry(ip, raspberry.info);
    item.innerText = `${nom} — ${onlineText}`;
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
      if (detailsDejaAffichesPour(hote, selected.ip)) {
        mettreAJourDetailsLegers(hote, selected);
      } else {
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

export function rafraichirDetailsSiSelection(
  hote: HotePanneauListe,
  ip: string,
  options?: { forcer?: boolean }
): void {
  if (hote.selectedRaspberryIp !== ip || !hote.detailsVisible) {
    return;
  }
  const raspberry = hote.raspberryMap.get(ip);
  if (!raspberry) {
    return;
  }
  if (!options?.forcer && detailsDejaAffichesPour(hote, ip)) {
    mettreAJourDetailsLegers(hote, raspberry);
    return;
  }
  afficherDetailsRaspberry(hote, raspberry);
}
