import type { CibleImportAudio } from "../Services/RaspberryImportAudioService";
import { formaterLibelleFichierPlay } from "../utils/osc/OscPlayHelpers";
import { synchroniserLibellesDepuisFichiers } from "../Services/RaspberryLibellesSonsStore";

const ID_OVERLAY = "raspberry-import-audio-overlay";

export type SelectionImportAudio = {
  ip: string;
  raspberryId: number;
  fichiers: string[];
};

function fermerOverlay(): void {
  document.getElementById(ID_OVERLAY)?.remove();
}

function appliquerStyleOverlay(overlay: HTMLDivElement): void {
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0, 0, 0, 0.45)";
  overlay.style.zIndex = "2000";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
}

function appliquerStyleModal(modal: HTMLDivElement): void {
  modal.style.background = "#1f252b";
  modal.style.color = "#f1f1f1";
  modal.style.padding = "20px";
  modal.style.border = "1px solid #3b4046";
  modal.style.borderRadius = "8px";
  modal.style.width = "460px";
  modal.style.maxHeight = "80vh";
  modal.style.overflow = "auto";
}

function lireCibleParIp(cibles: CibleImportAudio[], ip: string): CibleImportAudio | undefined {
  return cibles.find((cible) => cible.ip === ip);
}

/**
 * Fenetre pour importer des sons depuis sons/ sur un Pi vers la piste WAM liee.
 */
export function ouvrirFenetreImportAudio(params: {
  cibles: CibleImportAudio[];
  listerSons: (ip: string) => Promise<{ ok: true; fichiers: string[] } | { ok: false; error: string }>;
  onImporter: (selection: SelectionImportAudio) => Promise<{ ok: boolean; message: string }>;
}): void {
  fermerOverlay();

  const enLigne = params.cibles.filter((cible) => cible.enLigne);
  const overlay = document.createElement("div");
  overlay.id = ID_OVERLAY;
  appliquerStyleOverlay(overlay);

  const modal = document.createElement("div");
  appliquerStyleModal(modal);

  const titre = document.createElement("h3");
  titre.style.margin = "0 0 8px";
  titre.innerText = "Import Audio";
  modal.appendChild(titre);

  const hint = document.createElement("div");
  hint.style.fontSize = "12px";
  hint.style.opacity = "0.8";
  hint.style.marginBottom = "14px";
  hint.innerText =
    "Choisissez un Raspberry en ligne, cochez les sons dans sons/, puis importez-les sur la piste WAM liee (ex. rasp 75).";
  modal.appendChild(hint);

  const infoPiste = document.createElement("div");
  infoPiste.style.fontSize = "12px";
  infoPiste.style.marginBottom = "12px";
  infoPiste.style.color = "#9ecbff";
  modal.appendChild(infoPiste);

  const ligneRaspberry = document.createElement("div");
  ligneRaspberry.style.marginBottom = "12px";

  const labelRaspberry = document.createElement("label");
  labelRaspberry.style.display = "block";
  labelRaspberry.style.fontSize = "12px";
  labelRaspberry.style.marginBottom = "4px";
  labelRaspberry.innerText = "Raspberry";

  const selectRaspberry = document.createElement("select");
  selectRaspberry.style.width = "100%";
  selectRaspberry.disabled = enLigne.length === 0;

  if (enLigne.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.text = "Aucun Raspberry en ligne";
    selectRaspberry.appendChild(option);
  } else {
    for (const cible of enLigne) {
      const option = document.createElement("option");
      option.value = cible.ip;
      option.text = `${cible.nomAffichage} (${cible.ip}) → ${cible.nomPiste}`;
      selectRaspberry.appendChild(option);
    }
  }

  ligneRaspberry.appendChild(labelRaspberry);
  ligneRaspberry.appendChild(selectRaspberry);
  modal.appendChild(ligneRaspberry);

  const actionsListe = document.createElement("div");
  actionsListe.style.display = "flex";
  actionsListe.style.gap = "8px";
  actionsListe.style.marginBottom = "8px";

  const boutonActualiser = document.createElement("button");
  boutonActualiser.type = "button";
  boutonActualiser.className = "btn btn-sm btn-secondary";
  boutonActualiser.innerText = "Actualiser la liste";
  boutonActualiser.disabled = enLigne.length === 0;

  const boutonToutCocher = document.createElement("button");
  boutonToutCocher.type = "button";
  boutonToutCocher.className = "btn btn-sm btn-secondary";
  boutonToutCocher.innerText = "Tout cocher";
  boutonToutCocher.disabled = true;

  const boutonToutDecocher = document.createElement("button");
  boutonToutDecocher.type = "button";
  boutonToutDecocher.className = "btn btn-sm btn-secondary";
  boutonToutDecocher.innerText = "Tout decocher";
  boutonToutDecocher.disabled = true;

  actionsListe.appendChild(boutonActualiser);
  actionsListe.appendChild(boutonToutCocher);
  actionsListe.appendChild(boutonToutDecocher);
  modal.appendChild(actionsListe);

  const listeSons = document.createElement("div");
  listeSons.style.border = "1px solid #3b4046";
  listeSons.style.borderRadius = "6px";
  listeSons.style.padding = "8px";
  listeSons.style.maxHeight = "240px";
  listeSons.style.overflow = "auto";
  listeSons.style.fontSize = "13px";
  listeSons.innerText = enLigne.length === 0 ? "Aucun Raspberry disponible." : "Chargement...";
  modal.appendChild(listeSons);

  const statut = document.createElement("div");
  statut.style.fontSize = "12px";
  statut.style.margin = "12px 0 4px";
  statut.style.minHeight = "18px";
  statut.style.whiteSpace = "pre-wrap";
  modal.appendChild(statut);

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.justifyContent = "flex-end";
  actions.style.gap = "8px";
  actions.style.marginTop = "14px";

  const boutonFermer = document.createElement("button");
  boutonFermer.type = "button";
  boutonFermer.innerText = "Fermer";

  const boutonImporter = document.createElement("button");
  boutonImporter.type = "button";
  boutonImporter.innerText = "Importer la selection";
  boutonImporter.style.background = "#2e6da4";
  boutonImporter.style.color = "#fff";
  boutonImporter.style.border = "none";
  boutonImporter.style.padding = "6px 12px";
  boutonImporter.style.borderRadius = "4px";
  boutonImporter.disabled = enLigne.length === 0;

  let cases: HTMLInputElement[] = [];
  let chargement = false;

  const mettreAJourInfoPiste = () => {
    const cible = lireCibleParIp(enLigne, selectRaspberry.value);
    if (!cible) {
      infoPiste.innerText = "";
      return;
    }
    if (cible.pistePresente) {
      infoPiste.innerText = `Destination : piste ${cible.nomPiste}`;
    } else {
      infoPiste.innerText = `La piste ${cible.nomPiste} sera creee automatiquement a l'import.`;
    }
  };

  const lireFichiersCoches = (): string[] =>
    cases.filter((item) => item.checked).map((item) => item.value);

  const remplirListeSons = (fichiers: string[], ip: string) => {
    listeSons.innerHTML = "";
    cases = [];
    const libelles = synchroniserLibellesDepuisFichiers(ip, fichiers);

    if (fichiers.length === 0) {
      listeSons.innerText = "Aucun fichier audio dans sons/.";
      boutonToutCocher.disabled = true;
      boutonToutDecocher.disabled = true;
      return;
    }

    for (const nom of fichiers) {
      const ligne = document.createElement("label");
      ligne.style.display = "flex";
      ligne.style.alignItems = "center";
      ligne.style.gap = "8px";
      ligne.style.marginBottom = "6px";
      ligne.style.cursor = "pointer";

      const caseACocher = document.createElement("input");
      caseACocher.type = "checkbox";
      caseACocher.value = nom;
      cases.push(caseACocher);

      const texte = document.createElement("span");
      texte.innerText = formaterLibelleFichierPlay(nom, libelles);

      ligne.appendChild(caseACocher);
      ligne.appendChild(texte);
      listeSons.appendChild(ligne);
    }

    boutonToutCocher.disabled = false;
    boutonToutDecocher.disabled = false;
  };

  const chargerSons = async () => {
    const ip = selectRaspberry.value;
    if (!ip || chargement) {
      return;
    }
    chargement = true;
    boutonActualiser.disabled = true;
    boutonImporter.disabled = true;
    listeSons.innerText = "Chargement des fichiers sur le Pi...";
    statut.innerText = "";
    mettreAJourInfoPiste();

    const resultat = await params.listerSons(ip);
    chargement = false;
    boutonActualiser.disabled = false;
    boutonImporter.disabled = false;

    if (!resultat.ok) {
      listeSons.innerText = resultat.error;
      statut.innerText = resultat.error;
      cases = [];
      boutonToutCocher.disabled = true;
      boutonToutDecocher.disabled = true;
      return;
    }

    remplirListeSons(resultat.fichiers, ip);
    statut.innerText = `${resultat.fichiers.length} son(s) disponible(s) sur le Pi.`;
  };

  selectRaspberry.addEventListener("change", () => {
    mettreAJourInfoPiste();
    void chargerSons();
  });
  boutonActualiser.addEventListener("click", () => {
    void chargerSons();
  });
  boutonToutCocher.addEventListener("click", () => {
    cases.forEach((item) => {
      item.checked = true;
    });
  });
  boutonToutDecocher.addEventListener("click", () => {
    cases.forEach((item) => {
      item.checked = false;
    });
  });

  boutonFermer.addEventListener("click", () => {
    fermerOverlay();
  });

  boutonImporter.addEventListener("click", async () => {
    const ip = selectRaspberry.value;
    const cible = lireCibleParIp(enLigne, ip);
    const fichiers = lireFichiersCoches();
    if (!ip || !cible) {
      statut.innerText = "Choisissez un Raspberry.";
      return;
    }
    if (fichiers.length === 0) {
      statut.innerText = "Cochez au moins un son a importer.";
      return;
    }

    boutonImporter.disabled = true;
    statut.innerText = `Import de ${fichiers.length} fichier(s) vers ${cible.nomPiste}...`;
    const resultat = await params.onImporter({
      ip,
      raspberryId: cible.raspberryId,
      fichiers,
    });
    boutonImporter.disabled = false;
    statut.innerText = resultat.message;
    if (resultat.ok) {
      await chargerSons();
    }
  });

  actions.appendChild(boutonFermer);
  actions.appendChild(boutonImporter);
  modal.appendChild(actions);

  overlay.appendChild(modal);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay && !boutonImporter.disabled) {
      fermerOverlay();
    }
  });
  document.body.appendChild(overlay);

  if (enLigne.length > 0) {
    mettreAJourInfoPiste();
    void chargerSons();
  }
}
