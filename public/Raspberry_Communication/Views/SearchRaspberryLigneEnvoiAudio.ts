import type { CibleEnvoiAudio, OptionsEnvoiPiste } from "../Services/RaspberryEnvoiAudioLotService";

export type LigneEnvoiAudioDom = {
  bloc: HTMLDivElement;
  ip: string;
  nombreRegionsAudio: number;
  caseEnvoi: HTMLInputElement;
  caseDecoupage: HTMLInputElement;
  caseRenommage: HTMLInputElement;
  champsNoms: HTMLInputElement[];
};

function creerCaseOption(libelle: string, role: string): {
  ligne: HTMLLabelElement;
  caseACocher: HTMLInputElement;
} {
  const ligne = document.createElement("label");
  ligne.style.display = "flex";
  ligne.style.alignItems = "center";
  ligne.style.gap = "8px";
  ligne.style.fontSize = "12px";
  ligne.style.marginTop = "6px";
  ligne.style.cursor = "pointer";

  const caseACocher = document.createElement("input");
  caseACocher.type = "checkbox";
  caseACocher.dataset.role = role;

  const texte = document.createElement("span");
  texte.innerText = libelle;

  ligne.appendChild(caseACocher);
  ligne.appendChild(texte);
  return { ligne, caseACocher };
}

function appliquerStyleChampNom(champ: HTMLInputElement): void {
  champ.style.display = "block";
  champ.style.width = "100%";
  champ.style.marginTop = "4px";
  champ.style.boxSizing = "border-box";
  champ.style.padding = "6px 8px";
  champ.style.borderRadius = "4px";
  champ.style.border = "1px solid #555";
  champ.style.background = "#161a1e";
  champ.style.color = "#f1f1f1";
}

function creerChampNom(index: number, total: number): { wrap: HTMLDivElement; champ: HTMLInputElement } {
  const wrap = document.createElement("div");
  wrap.style.marginTop = "8px";
  wrap.dataset.nomIndex = String(index);

  const label = document.createElement("label");
  label.style.display = "block";
  label.style.fontSize = "11px";
  label.style.opacity = "0.85";
  label.innerText = total > 1 ? `Nom du son ${index + 1}` : "Nom du son";

  const champ = document.createElement("input");
  champ.type = "text";
  champ.placeholder = total > 1 ? `son ${index + 1} (vide = auto)` : "ex. believer (vide = auto)";
  champ.maxLength = 40;
  champ.dataset.role = "nom-son";
  appliquerStyleChampNom(champ);

  wrap.appendChild(label);
  wrap.appendChild(champ);
  return { wrap, champ };
}

function nombreChampsNomsVisibles(ligne: LigneEnvoiAudioDom): number {
  if (!ligne.caseRenommage.checked) {
    return 0;
  }
  if (ligne.caseDecoupage.checked) {
    return Math.max(1, ligne.nombreRegionsAudio);
  }
  return 1;
}

function synchroniserEtatLigne(ligne: LigneEnvoiAudioDom): void {
  const envoiActif = ligne.caseEnvoi.checked && !ligne.caseEnvoi.disabled;
  ligne.caseDecoupage.disabled = !envoiActif;
  ligne.caseRenommage.disabled = !envoiActif;

  const visibles = envoiActif ? nombreChampsNomsVisibles(ligne) : 0;
  const totalLabels = visibles || 1;
  ligne.champsNoms.forEach((champ, index) => {
    const wrap = champ.parentElement as HTMLDivElement | null;
    const visible = index < visibles;
    if (wrap) {
      wrap.style.display = visible ? "block" : "none";
      const label = wrap.querySelector("label");
      if (label) {
        label.innerText = totalLabels > 1 ? `Nom du son ${index + 1}` : "Nom du son";
      }
    }
    champ.disabled = !visible;
    champ.placeholder = totalLabels > 1 ? `son ${index + 1} (vide = auto)` : "ex. believer (vide = auto)";
  });
}

/**
 * Une carte Send Audio : envoi + decoupage + un nom par son.
 */
export function construireLigneEnvoiAudio(cible: CibleEnvoiAudio): LigneEnvoiAudioDom {
  const bloc = document.createElement("div");
  bloc.style.border = "1px solid #3b4046";
  bloc.style.borderRadius = "6px";
  bloc.style.padding = "10px";
  bloc.style.marginBottom = "10px";
  bloc.dataset.ip = cible.raspberry.ip;

  const enTete = document.createElement("label");
  enTete.style.display = "flex";
  enTete.style.alignItems = "center";
  enTete.style.justifyContent = "space-between";
  enTete.style.gap = "10px";
  enTete.style.cursor = cible.raspberry.isOnline ? "pointer" : "not-allowed";

  const texte = document.createElement("span");
  const etat = cible.raspberry.isOnline ? "en ligne" : "hors ligne";
  const piste = cible.pistePresente ? cible.nomPiste : "aucune piste";
  texte.innerText = `${cible.nomAffichage} — ${piste} (${etat})`;
  texte.style.opacity = cible.raspberry.isOnline ? "1" : "0.6";

  const caseEnvoi = document.createElement("input");
  caseEnvoi.type = "checkbox";
  caseEnvoi.value = cible.raspberry.ip;
  caseEnvoi.dataset.role = "envoi";
  caseEnvoi.disabled = !cible.raspberry.isOnline || !cible.pistePresente;
  caseEnvoi.checked = cible.raspberry.isOnline && cible.pistePresente;

  enTete.appendChild(texte);
  enTete.appendChild(caseEnvoi);
  bloc.appendChild(enTete);

  const decoupage = creerCaseOption(
    cible.nombreRegionsAudio > 1
      ? `Découper aux coupures (${cible.nombreRegionsAudio} sons)`
      : "Découper aux coupures (1 région = 1 son)",
    "decoupage"
  );
  const renommage = creerCaseOption("Renommer les sons", "renommage");
  bloc.appendChild(decoupage.ligne);
  bloc.appendChild(renommage.ligne);

  const conteneurNoms = document.createElement("div");
  const champsNoms: HTMLInputElement[] = [];
  const nombreChamps = Math.max(1, cible.nombreRegionsAudio);
  for (let index = 0; index < nombreChamps; index++) {
    const { wrap, champ } = creerChampNom(index, nombreChamps);
    champsNoms.push(champ);
    conteneurNoms.appendChild(wrap);
  }
  bloc.appendChild(conteneurNoms);

  const ligne: LigneEnvoiAudioDom = {
    bloc,
    ip: cible.raspberry.ip,
    nombreRegionsAudio: cible.nombreRegionsAudio,
    caseEnvoi,
    caseDecoupage: decoupage.caseACocher,
    caseRenommage: renommage.caseACocher,
    champsNoms,
  };

  caseEnvoi.addEventListener("change", () => synchroniserEtatLigne(ligne));
  decoupage.caseACocher.addEventListener("change", () => synchroniserEtatLigne(ligne));
  renommage.caseACocher.addEventListener("change", () => {
    synchroniserEtatLigne(ligne);
    if (ligne.caseRenommage.checked) {
      ligne.champsNoms[0]?.focus();
    }
  });
  synchroniserEtatLigne(ligne);
  return ligne;
}

export function lireOptionsDepuisLigne(ligne: LigneEnvoiAudioDom): OptionsEnvoiPiste {
  const visibles = nombreChampsNomsVisibles(ligne);
  return {
    decoupage: ligne.caseDecoupage.checked,
    renommage: ligne.caseRenommage.checked,
    nomsSons: ligne.champsNoms.slice(0, visibles).map((champ) => champ.value),
  };
}
